import { Flat } from "./flat";
import { LumpInfo } from "../wad/types";
import { LumpReader } from "../wad/lump-reader";
import {
  CandyTextureMapper,
  CANDY_COLORS,
} from "../rendering/candy-texture-mapper";

interface FlatLump {
  lump: number;
  name: string;
  flat: Flat;
}

export class FlatArray extends Array<FlatLump> {
  static get [Symbol.species](): ArrayConstructor {
    return Array;
  }

  private translation = new Array<number>();
  private candyMapper = new CandyTextureMapper();

  constructor(lumpReader?: LumpReader) {
    super();

    lumpReader && this.load(lumpReader);
  }

  load(lumpReader: LumpReader) {
    this.length = 0;

    const firstFlat = lumpReader.getNumForName("F_START") + 1;
    const lastFlat = lumpReader.getNumForName("F_END") - 1;
    const num = lastFlat - firstFlat + 1;

    let lumpInfo: LumpInfo;
    let name: string;
    let altLump: number;
    for (let lump = firstFlat; lump <= lastFlat; ++lump) {
      lumpInfo = lumpReader.lumpInfo[lump];
      name = lumpInfo.name;

      altLump = lumpReader.getNumForName(name);

      this.push({
        lump: altLump,
        name,
        flat: this.generateColoredFlat(name),
      });
    }

    // Create translation table for global animation.
    this.translation = Array.from({ length: num + 1 }, (_, i) => i);
  }

  private generateColoredFlat(name: string): Flat {
    const flat = new Flat();
    const textureType = this.candyMapper.mapTexture(name);
    const color = this.getColorForFlat(textureType);

    for (let i = 0; i < flat.length; i++) {
      const x = i % 64;
      const y = Math.floor(i / 64);

      const isOutline = x < 2 || x >= 62 || y < 2 || y >= 62;

      if (isOutline) {
        flat[i] = this.colorToPaletteIndex(
          CANDY_COLORS.deepSpace.r,
          CANDY_COLORS.deepSpace.g,
          CANDY_COLORS.deepSpace.b,
        );
      } else {
        const variation = Math.floor(Math.random() * 10) - 5;
        flat[i] = this.colorToPaletteIndex(
          Math.max(0, Math.min(255, color.r + variation)),
          Math.max(0, Math.min(255, color.g + variation)),
          Math.max(0, Math.min(255, color.b + variation)),
        );
      }
    }

    return flat;
  }

  private getColorForFlat(textureType: string) {
    switch (textureType) {
      case "wall-toxic":
      case "floor-hazard":
        return CANDY_COLORS.toxicLime;
      case "wall-lava":
        return CANDY_COLORS.rageOrange;
      case "wall-sky":
        return CANDY_COLORS.skyPop;
      default:
        return CANDY_COLORS.cottonCloud;
    }
  }

  private colorToPaletteIndex(r: number, g: number, b: number): number {
    return Math.floor((r + g + b) / 3);
  }

  //
  // R_FlatNumForName
  // Retrieval, get a flat number for a flat name.
  //
  numForName(name: string): number {
    const i = this.findIndex(
      (l) => l.name.toUpperCase() === name.toUpperCase(),
    );
    if (i === -1) {
      throw `R_FlatNumForName: ${name} not found`;
    }
    return i;
  }

  getNum(num: number): number {
    return this.translation[num];
  }
  get(num: number): Flat {
    return this[this.translation[num]].flat;
  }
  translate(src: number, dest: number): void {
    this.translation[src] = dest;
  }
}
