import { Column } from "../rendering/defs/column";
import { FRACBITS } from "../misc/fixed";
import { LumpReader } from "../wad/lump-reader";
import { MapTextureArray } from "./map-texture-array";
import { PNameArray } from "./pname-array";
import { Patch } from "../rendering/defs/patch";
import { Post } from "../rendering/defs/post";
import { Texture } from "../rendering/data/texture";
import {
  CandyTextureMapper,
  CANDY_COLORS,
} from "../rendering/candy-texture-mapper";

interface TextureLump {
  name: string;
  widthMask: number;
  height: number;
  patch: Patch;
}

export class TextureArray extends Array<TextureLump> {
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

    const names = lumpReader.cacheLumpName("PNAMES", PNameArray);
    const patchLookup = names.getLookup(lumpReader);

    const mapTextures = [
      ...lumpReader.cacheLumpName("TEXTURE1", MapTextureArray),
    ];
    if (lumpReader.checkNumForName("TEXTURE2") !== -1) {
      mapTextures.push(
        ...lumpReader.cacheLumpName("TEXTURE2", MapTextureArray),
      );
    }

    this.length = mapTextures.length;

    let texture: Texture;
    let j: number;
    for (let i = 0; i < this.length; ++i) {
      texture = mapTextures[i].getTexture(patchLookup);
      j = 1;
      while (j * 2 <= texture.width) {
        j <<= 1;
      }
      this[i] = {
        name: texture.name,
        height: texture.height << FRACBITS,
        widthMask: j - 1,
        patch: this.generateComposite(texture, lumpReader),
      };
    }

    // Create translation table for global animation.
    this.translation = Array.from({ length: this.length + 1 }, (_, i) => i);
  }

  //
  // R_DrawColumnInCache
  // Clip and draw a column
  //  from a patch into a cached post.
  //
  drawColumnInCache(
    patch: Column,
    cache: Column,
    originY: number,
    cacheHeight: number,
  ): void {
    let count: number;
    let position: number;

    let col: Post;
    for (col of patch.posts) {
      count = col.length;
      position = originY + col.topDelta;

      if (position < 0) {
        count += position;
        position = 0;
      }

      if (position + count > cacheHeight) {
        count = cacheHeight - position;
      }

      if (count > 0) {
        cache.posts[0].bytes.set(col.bytes.slice(0, count), position);
      }
    }
  }

  //
  // R_GenerateComposite
  // Generate a solid colored texture based on texture name
  // using Candy Apocalypse color mapping
  //
  private generateComposite(texture: Texture, _lumpReader: LumpReader): Patch {
    const textureType = this.candyMapper.mapTexture(texture.name);
    const color = this.getColorForTexture(textureType);

    const columns: Column[] = [];

    for (let x = 0; x < texture.width; x++) {
      const post = new Post(texture.height);

      for (let y = 0; y < texture.height; y++) {
        const isOutline =
          x < 2 || x >= texture.width - 2 || y < 2 || y >= texture.height - 2;

        if (isOutline) {
          post.bytes[y] = this.colorToPaletteIndex(
            CANDY_COLORS.deepSpace.r,
            CANDY_COLORS.deepSpace.g,
            CANDY_COLORS.deepSpace.b,
          );
        } else {
          post.bytes[y] = this.colorToPaletteIndex(color.r, color.g, color.b);
        }
      }

      columns.push(new Column([post]));
    }

    const p = new Patch(columns);
    p.width = texture.width;
    p.height = texture.height;

    return p;
  }

  private getColorForTexture(textureType: string) {
    switch (textureType) {
      case "wall-sky":
        return CANDY_COLORS.skyPop;
      case "wall-toxic":
        return CANDY_COLORS.toxicLime;
      case "wall-lava":
        return CANDY_COLORS.rageOrange;
      case "item-door-closed":
      case "item-door-open":
        return CANDY_COLORS.mysticViolet;
      case "item-switch-off":
        return CANDY_COLORS.cherryBomb;
      case "item-switch-on":
        return CANDY_COLORS.solarBurst;
      default:
        return CANDY_COLORS.cottonCloud;
    }
  }

  private colorToPaletteIndex(r: number, g: number, b: number): number {
    const brightness = (r + g + b) / 3;

    if (brightness < 50) return 0;
    if (brightness < 100) return 32;
    if (brightness < 150) return 80;
    if (brightness < 200) return 160;
    return 250;
  }

  //
  // R_CheckTextureNumForName
  // Check whether texture is available.
  // Filter out NoTexture indicator.
  //
  checkNumForName(name: string): number {
    // "NoTexture" marker.
    if (name.startsWith("-")) {
      return 0;
    }

    const i = this.findIndex(
      (l) => l.name.toUpperCase() === name.toUpperCase(),
    );

    return i;
  }

  //
  // R_TextureNumForName
  // Calls R_CheckTextureNumForName,
  //  aborts with error message.
  //
  numForName(name: string): number {
    const i = this.checkNumForName(name);

    if (i === -1) {
      throw `R_TextureNumForName: ${name} not found`;
    }
    return i;
  }

  getNum(num: number): number {
    return this.translation[num];
  }
  getColumn(num: number, col: number): Column {
    const texture = this[this.translation[num]];
    col &= texture.widthMask;
    return texture.patch.columns[col];
  }
  getHeight(num: number): number {
    return this[this.translation[num]].height;
  }
  translate(src: number, dest: number): void {
    this.translation[src] = dest;
  }
}
