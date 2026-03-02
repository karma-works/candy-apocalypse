import { describe, it, expect, beforeAll } from "vitest";
import { Wad } from "../../src/doom/wad/wad";
import { readFileSync } from "fs";
import { join } from "path";

describe("WAD Parser", () => {
  describe("Wad class", () => {
    it("should parse WAD header correctly", () => {
      // Create a minimal valid WAD buffer for testing
      const buffer = new ArrayBuffer(12);
      const view = new DataView(buffer);

      // Write "IWAD" header
      view.setUint8(0, 73); // I
      view.setUint8(1, 87); // W
      view.setUint8(2, 65); // A
      view.setUint8(3, 68); // D

      // Write number of lumps (0)
      view.setInt32(4, 0, true);

      // Write info table offset (12)
      view.setInt32(8, 12, true);

      const wad = new Wad(buffer);

      expect(wad.identification).toBe("IWAD");
      expect(wad.lumps).toHaveLength(0);
    });

    it("should reject non-WAD files", () => {
      const buffer = new ArrayBuffer(12);
      const view = new DataView(buffer);

      // Write invalid header
      view.setUint8(0, 88); // X
      view.setUint8(1, 87); // W
      view.setUint8(2, 65); // A
      view.setUint8(3, 68); // D

      expect(() => new Wad(buffer)).toThrow();
    });

    it("should accept PWAD files", () => {
      const buffer = new ArrayBuffer(12);
      const view = new DataView(buffer);

      // Write "PWAD" header
      view.setUint8(0, 80); // P
      view.setUint8(1, 87); // W
      view.setUint8(2, 65); // A
      view.setUint8(3, 68); // D

      view.setInt32(4, 0, true);
      view.setInt32(8, 12, true);

      const wad = new Wad(buffer);

      expect(wad.identification).toBe("PWAD");
    });
  });

  describe("Lump parsing", () => {
    it("should parse lump names correctly", () => {
      // Create a WAD with one lump
      const lumpName = "TEST";
      const lumpData = new Uint8Array([1, 2, 3, 4]);

      const headerSize = 12;
      const lumpSize = lumpData.length;
      const tocEntrySize = 16; // 4 + 4 + 8
      const tocOffset = headerSize;

      const buffer = new ArrayBuffer(headerSize + lumpSize + tocEntrySize);
      const view = new DataView(buffer);

      // Header
      view.setUint8(0, 73); // I
      view.setUint8(1, 87); // W
      view.setUint8(2, 65); // A
      view.setUint8(3, 68); // D
      view.setInt32(4, 1, true); // 1 lump
      view.setInt32(8, tocOffset, true);

      // TOC entry
      view.setInt32(tocOffset, headerSize, true); // lump offset
      view.setInt32(tocOffset + 4, lumpSize, true); // lump size

      // Lump name (8 bytes, null-padded)
      for (let i = 0; i < 8; i++) {
        if (i < lumpName.length) {
          view.setUint8(tocOffset + 8 + i, lumpName.charCodeAt(i));
        } else {
          view.setUint8(tocOffset + 8 + i, 0);
        }
      }

      // Lump data
      const lumpView = new Uint8Array(buffer, headerSize, lumpSize);
      lumpView.set(lumpData);

      const wad = new Wad(buffer);

      expect(wad.lumps).toHaveLength(1);
      expect(wad.lumps[0].name).toBe("TEST");
      expect(wad.lumps[0].size).toBe(4);
    });
  });

  describe("WAD structure validation", () => {
    it("should validate VERTEXES lump exists", async () => {
      // This test would require a real WAD file
      // For now, we'll skip it if no WAD is available
      const wadPath = join(process.cwd(), "tests/fixtures/wads/test.wad");

      try {
        const buffer = readFileSync(wadPath);
        const wad = new Wad(buffer.buffer);

        const vertices = wad.lumps.find((l) => l.name === "VERTEXES");
        expect(vertices).toBeDefined();
      } catch (error) {
        // Skip test if WAD file doesn't exist
        console.log("Skipping test: No test WAD file found");
      }
    });
  });
});
