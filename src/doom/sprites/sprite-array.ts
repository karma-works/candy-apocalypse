import { FRACBITS } from "../misc/fixed";
import { LumpInfo } from "../wad/types";
import { LumpReader } from "../wad/lump-reader";
import { Patch } from "../rendering/defs/patch";
import { Column } from "../rendering/defs/column";
import { Post } from "../rendering/defs/post";
import { CANDY_COLORS } from "../rendering/candy-texture-mapper";

export interface SpriteLump {
  lump: number;
  patch: Patch;
  name: string;

  width: number;
  leftOffset: number;
  topOffset: number;
}

export class SpriteArray extends Array<SpriteLump> {
  static get [Symbol.species](): ArrayConstructor {
    return Array;
  }

  constructor(lumpReader?: LumpReader) {
    super();

    lumpReader && this.load(lumpReader);
  }

  load(lumpReader: LumpReader) {
    this.length = 0;

    const first = lumpReader.getNumForName("S_START") + 1;
    const last = lumpReader.getNumForName("S_END") - 1;

    let lumpInfo: LumpInfo;
    let name: string;
    let altLump: number;
    for (let i = 0, lump = first; lump <= last; ++i, ++lump) {
      lumpInfo = lumpReader.lumpInfo[lump];
      name = lumpInfo.name;

      altLump = lumpReader.getNumForName(name);

      // Load original patch to preserve dimensions and offsets
      const originalPatch = lumpReader.cacheLumpNum(altLump, Patch);

      // Generate colored sprite with same dimensions
      const patch = this.generateColoredSprite(name, originalPatch);

      this[i] = {
        lump: altLump,
        patch,
        name,

        width: patch.width << FRACBITS,
        leftOffset: patch.leftOffset << FRACBITS,
        topOffset: patch.topOffset << FRACBITS,
      };
    }
  }

  private generateColoredSprite(name: string, originalPatch: Patch): Patch {
    const width = originalPatch.width;
    const height = originalPatch.height;

    const columns: Column[] = [];
    const color = this.getColorForSprite(name);

    for (let x = 0; x < width; x++) {
      const post = new Post(height);

      for (let y = 0; y < height; y++) {
        const isOutline = x < 2 || x >= width - 2 || y < 2 || y >= height - 2;

        if (isOutline) {
          post.bytes[y] = this.colorToPaletteIndex(
            CANDY_COLORS.deepSpace.r,
            CANDY_COLORS.deepSpace.g,
            CANDY_COLORS.deepSpace.b,
          );
        } else {
          const variation = Math.floor(Math.random() * 15) - 7;
          post.bytes[y] = this.colorToPaletteIndex(
            Math.max(0, Math.min(255, color.r + variation)),
            Math.max(0, Math.min(255, color.g + variation)),
            Math.max(0, Math.min(255, color.b + variation)),
          );
        }
      }

      columns.push(new Column([post]));
    }

    const patch = new Patch(columns);
    patch.width = width;
    patch.height = height;
    patch.leftOffset = originalPatch.leftOffset;
    patch.topOffset = originalPatch.topOffset;

    return patch;
  }

  private getColorForSprite(name: string) {
    const upperName = name.toUpperCase();

    if (upperName.includes("TROO") || upperName.includes("IMP")) {
      return CANDY_COLORS.cottonCloud;
    }
    if (upperName.includes("POSS") || upperName.includes("ZOMB")) {
      return CANDY_COLORS.solarBurst;
    }
    if (upperName.includes("SARG") || upperName.includes("DEMON")) {
      return CANDY_COLORS.rageOrange;
    }
    if (upperName.includes("HEAD") || upperName.includes("CACO")) {
      return CANDY_COLORS.cherryBomb;
    }
    if (upperName.includes("BAR") || upperName.includes("BOS")) {
      return CANDY_COLORS.mysticViolet;
    }
    if (upperName.includes("SKUL") || upperName.includes("SOUL")) {
      return CANDY_COLORS.toxicLime;
    }
    if (upperName.includes("PLAS") || upperName.includes("BFG")) {
      return CANDY_COLORS.skyPop;
    }

    return CANDY_COLORS.cottonCloud;
  }

  private colorToPaletteIndex(r: number, g: number, b: number): number {
    return Math.floor((r + g + b) / 3);
  }
}
