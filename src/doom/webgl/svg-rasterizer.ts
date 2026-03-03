import { CanvasTexture, Texture } from "three";

export interface SvgSymbol {
  id: string;
  viewBox: string;
  content: string;
  width: number;
  height: number;
  defs: string;
}

function parseViewBox(viewBox: string): { width: number; height: number } {
  const parts = viewBox.split(/\s+/).map(Number);
  if (parts.length >= 4) {
    return { width: parts[2], height: parts[3] };
  }
  return { width: 64, height: 64 };
}

function extractDefs(content: string): {
  defs: string;
  contentWithoutDefs: string;
} {
  const defsMatch = content.match(/<defs>([\s\S]*?)<\/defs>/i);
  const defs = defsMatch ? defsMatch[1] : "";
  const contentWithoutDefs = content.replace(/<defs>[\s\S]*?<\/defs>/i, "");
  return { defs, contentWithoutDefs };
}

export class SvgRasterizer {
  private symbols: Map<string, SvgSymbol> = new Map();
  private textureCache: Map<string, Texture> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const response = await fetch("/assets/spritemap.svg");
      if (!response.ok) {
        console.warn("SvgRasterizer: Could not load spritemap.svg");
        return;
      }
      const text = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "image/svg+xml");

      const symbolElements = doc.querySelectorAll("symbol");

      symbolElements.forEach((symbol) => {
        const id = symbol.getAttribute("id");
        const viewBox = symbol.getAttribute("viewBox") || "0 0 64 64";
        const rawContent = symbol.innerHTML;
        const dimensions = parseViewBox(viewBox);
        const { defs, contentWithoutDefs } = extractDefs(rawContent);

        if (id) {
          this.symbols.set(id.toLowerCase(), {
            id,
            viewBox,
            content: contentWithoutDefs,
            width: dimensions.width,
            height: dimensions.height,
            defs,
          });
        }
      });

      console.log(
        `SvgRasterizer: Loaded ${this.symbols.size} symbols from spritemap.`,
      );
      this.initialized = true;
    } catch (e) {
      console.error("SvgRasterizer: Failed to initialize", e);
    }
  }

  hasSymbol(id: string): boolean {
    return this.symbols.has(id.toLowerCase());
  }

  getSymbolDimensions(id: string): { width: number; height: number } | null {
    const symbol = this.symbols.get(id.toLowerCase());
    if (!symbol) return null;
    return { width: symbol.width, height: symbol.height };
  }

  private resolveUseReferences(
    content: string,
    defsAccum: Set<string>,
    depth: number = 0,
  ): string {
    if (depth > 5) return content;

    const useRegex =
      /<use\s+href="#([^"]+)"(?:\s+x="([^"]*)")?(?:\s+y="([^"]*)")?(?:\s+width="([^"]*)")?(?:\s+height="([^"]*)")?\s*\/?>/gi;

    let result = content;
    let match;

    while ((match = useRegex.exec(content)) !== null) {
      const [fullMatch, refId, x = "0", y = "0", w, h] = match;
      const refSymbol = this.symbols.get(refId.toLowerCase());

      if (refSymbol) {
        if (refSymbol.defs) {
          defsAccum.add(refSymbol.defs);
        }

        const resolvedContent = this.resolveUseReferences(
          refSymbol.content,
          defsAccum,
          depth + 1,
        );

        let transform = "";
        if (x !== "0" || y !== "0") {
          transform = ` transform="translate(${x}, ${y})"`;
        }

        let groupAttrs = transform;
        if (w && h) {
          const vb = parseViewBox(refSymbol.viewBox);
          const scaleX = parseFloat(w) / vb.width;
          const scaleY = parseFloat(h) / vb.height;
          if (scaleX !== 1 || scaleY !== 1) {
            groupAttrs = ` transform="translate(${x}, ${y}) scale(${scaleX}, ${scaleY})"`;
          }
        }

        const replacement = `<g${groupAttrs}>${resolvedContent}</g>`;
        result = result.replace(fullMatch, replacement);
      }
    }

    return result;
  }

  getTexture(id: string, width?: number, height?: number): Texture | null {
    const symbol = this.symbols.get(id.toLowerCase());
    if (!symbol) {
      console.warn(`SvgRasterizer: Symbol "${id}" not found in spritemap`);
      return null;
    }

    const actualWidth = width ?? symbol.width;
    const actualHeight = height ?? symbol.height;

    const cacheKey = `${id.toLowerCase()}_${actualWidth}x${actualHeight}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const defsAccum = new Set<string>();
    if (symbol.defs) {
      defsAccum.add(symbol.defs);
    }

    const resolvedContent = this.resolveUseReferences(
      symbol.content,
      defsAccum,
    );
    const allDefs = Array.from(defsAccum).join("\n");

    const svgStr = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.viewBox}" width="${actualWidth}" height="${actualHeight}">
  <defs>${allDefs}</defs>
  ${resolvedContent}
</svg>`.trim();

    const canvas = document.createElement("canvas");
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = "srgb";

    const img = new Image();
    img.crossOrigin = "anonymous";
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.clearRect(0, 0, actualWidth, actualHeight);
      ctx.drawImage(img, 0, 0, actualWidth, actualHeight);
      texture.needsUpdate = true;
      URL.revokeObjectURL(url);
    };

    img.onerror = (e) => {
      console.error(`SvgRasterizer: Error loading SVG image for ${id}`, e);
      URL.revokeObjectURL(url);
    };

    img.src = url;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  getFallbackTexture(
    type: "wall" | "flat" | "sprite",
    name: string,
    width: number = 64,
    height: number = 64,
  ): Texture {
    const cacheKey = `fallback_${type}_${name}_${width}x${height}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      let fillColor = "#FFB7C5";
      let strokeColor = "#1A1A2E";

      if (type === "wall") {
        fillColor = "#FFB7C5";
      } else if (type === "flat") {
        fillColor = "#00D4FF";
      } else {
        fillColor = "#FFE135";
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, width - 4, height - 4);
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = "srgb";
    this.textureCache.set(cacheKey, texture);
    return texture;
  }
}

export const svgRasterizer = new SvgRasterizer();
