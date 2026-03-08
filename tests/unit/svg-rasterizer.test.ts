import { describe, it, expect } from "vitest";
import { SvgRasterizer } from "../../src/doom/webgl/svg-rasterizer";
import fs from "fs";
import path from "path";

describe("SvgRasterizer", () => {
  it("should resolve POSSA0 correctly", async () => {
    const r = new SvgRasterizer();

    // Mock fetch to load the spritemap locally
    global.fetch = async (url) => {
      return {
        ok: true,
        text: async () => fs.readFileSync(path.resolve(__dirname, "../../public/assets/spritemap.svg"), "utf8")
      } as any;
    };

    await r.init();

    const symbol = r.symbols.get("possa0");
    expect(symbol).toBeDefined();

    const defsAccum = new Set<string>();
    const resolvedContent = r.resolveUseReferences(symbol!.content, defsAccum);
    const allDefs = Array.from(defsAccum).join("\n");
    const svgStr = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol!.viewBox}" width="64" height="64">
  <defs>${allDefs}</defs>
  <g transform="translate(0, 0) scale(1, 1)">
    ${resolvedContent}
  </g>
</svg>`.trim();

    // Write the debug output
    fs.writeFileSync(path.resolve(__dirname, "../../tmp_svg_dump.svg"), svgStr);
    console.log("Wrote SVG dump to tmp_svg_dump.svg");

    // Basic assertions
    // The cheerful_zombie ref gets resolved so the literal ID might be gone
    expect(svgStr).toContain("<linearGradient id=\"zombieSkin\"");
  });
});
