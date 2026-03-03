import { ColorMap, ColorMaps } from "../interfaces/colormap";
import {
  DataTexture,
  EquirectangularRefractionMapping,
  RGBAFormat,
} from "three";
import { Palette, Palettes } from "../interfaces/palette";
import { FlatArray } from "../textures/flat-array";
import { FlatTexture } from "./textures/flat-texture";
import { Video as IVideo } from "../interfaces/video";
import { LumpReader } from "../wad/lump-reader";
import { PaletteTexture } from "./textures/palette-texture";
import { Patch } from "../rendering/defs/patch";
import { PatchTexture } from "./textures/patch-texture";
import { Video as RVideo } from "../rendering/video";
import { SpriteArray } from "../sprites/sprite-array";
import { SpriteDefsArray } from "../sprites/sprite-defs-array";
import { SpriteNum } from "../doom/info/sprite-num";
import { SpriteTexture } from "./textures/sprite-texture";
import { TextureArray } from "../textures/texture-array";
import { svgRasterizer } from "./svg-rasterizer";

const SPRITE_TO_SVG_MAP: Record<string, string> = {
  fatt: "manc",
  skul: "pige",
  cpos: "karn",
  spos: "pigy",
  chgg: "mgun",
  misg: "laun",
  plsg: "plas",
  bfgg: "bfug",
  sawg: "csaw",
};

export type PatchTextures = {
  map: PatchTexture;
  alphaMap: PatchTexture;
  transparent: boolean;
  patch: Patch;
};

export class TextureLoader {
  private patchTextureCache: PatchTextures[] = [];
  private skyTextureCache: DataTexture[] = [];
  private flatTextureCache: FlatTexture[] = [];
  private spriteCache: SpriteTexture[] = [];

  paletteTexture: PaletteTexture;

  flats: FlatArray;
  sprites: SpriteArray;
  spriteDefs: SpriteDefsArray;
  textures: TextureArray;

  constructor(lumpReader?: LumpReader) {
    let palette: Palette;
    let colorMap: ColorMap;
    if (lumpReader) {
      const palettes = lumpReader.cacheLumpName(
        Palettes.DEFAULT_LUMP,
        Palettes,
      );
      palette = palettes.p[0];
      const colorMaps = lumpReader.cacheLumpName(
        ColorMaps.DEFAULT_LUMP,
        ColorMaps,
      );
      colorMap = colorMaps.c[0];
    } else {
      palette = new Palette();
      colorMap = new ColorMap();
    }
    this.paletteTexture = new PaletteTexture(palette, colorMap);

    this.flats = new FlatArray(lumpReader);
    this.sprites = new SpriteArray(lumpReader);
    this.spriteDefs = new SpriteDefsArray(this.sprites);
    this.textures = new TextureArray(lumpReader);
  }

  dispose() {
    this.paletteTexture.dispose();
    this.patchTextureCache.forEach(({ map, alphaMap }) => {
      map.dispose();
      alphaMap.dispose();
    });
    this.skyTextureCache.forEach((t) => t.dispose());
    this.flatTextureCache.forEach((t) => t.dispose());
  }

  getPatchTexture(num: number): PatchTextures {
    num = this.textures.getNum(num);

    if (!this.patchTextureCache[num]) {
      const patch = this.textures[num].patch;
      const patchName = this.textures[num].name || "UNKNOWN";
      let tex = svgRasterizer.getTexture(patchName, patch.width, patch.height);
      if (!tex)
        tex = svgRasterizer.getFallbackTexture(
          "wall",
          patchName,
          patch.width || 64,
          patch.height || 64,
        );
      tex.userData.isSvg = true;

      const patchTex: PatchTextures = {
        map: tex as any,
        alphaMap: tex as any,
        transparent: true,
        patch,
      };

      this.patchTextureCache[num] = patchTex;
    }
    return this.patchTextureCache[num];
  }

  getFlatTexture(num: number): FlatTexture {
    num = this.flats.getNum(num);

    if (!this.flatTextureCache[num]) {
      const flatName = this.flats[num].name || "UNKNOWN";
      let tex = svgRasterizer.getTexture(flatName, 64, 64);
      if (!tex)
        tex = svgRasterizer.getFallbackTexture("flat", flatName, 64, 64);
      tex.userData.isSvg = true;

      this.flatTextureCache[num] = tex as any;
    }
    return this.flatTextureCache[num];
  }

  getSpriteTexture(num: SpriteNum): SpriteTexture {
    if (!this.spriteCache[num]) {
      const sprDef = this.spriteDefs[num];
      const firstLumpIndex = sprDef.frames[0]?.lump[0];
      const spriteLump =
        firstLumpIndex !== undefined && firstLumpIndex !== -1
          ? this.sprites[firstLumpIndex]
          : null;

      const fullSpriteName = spriteLump?.name || "UNKNOWN";
      const spriteName4 = fullSpriteName.substring(0, 4).toLowerCase();
      const frameChar =
        fullSpriteName.length > 4
          ? fullSpriteName.substring(4).toLowerCase()
          : "a0";

      const width = spriteLump ? spriteLump.patch.width || 64 : 64;
      const height = spriteLump ? spriteLump.patch.height || 64 : 64;
      const bottomOffset = spriteLump
        ? spriteLump.patch.topOffset || height
        : height;

      const svgPrefix = SPRITE_TO_SVG_MAP[spriteName4] || spriteName4;

      console.log(
        `Loading sprite: ${fullSpriteName} -> ${svgPrefix}${frameChar}`,
      );

      let tex = svgRasterizer.getTexture(svgPrefix + frameChar, width, height);
      if (!tex)
        tex = svgRasterizer.getTexture(spriteName4 + frameChar, width, height);
      if (!tex) tex = svgRasterizer.getTexture(svgPrefix + "a0", width, height);
      if (!tex)
        tex = svgRasterizer.getTexture(spriteName4 + "a0", width, height);
      if (!tex) tex = svgRasterizer.getTexture(spriteName4, width, height);
      if (!tex) {
        console.warn(
          `No SVG found for sprite ${fullSpriteName}, using fallback`,
        );
        tex = svgRasterizer.getFallbackTexture(
          "sprite",
          fullSpriteName,
          width,
          height,
        );
      }
      tex.userData.isSvg = true;

      const fakeSpriteTexture: any = tex;
      fakeSpriteTexture.rotations = 1;
      fakeSpriteTexture.frames = sprDef.frames.length;
      fakeSpriteTexture.width = width;
      fakeSpriteTexture.height = height;
      fakeSpriteTexture.bottomOffset = bottomOffset;

      this.spriteCache[num] = fakeSpriteTexture;
    }
    return this.spriteCache[num];
  }

  getSkyTexture(num: number): DataTexture {
    const palette = this.paletteTexture.palette;
    num = this.textures.getNum(num);

    if (!this.skyTextureCache[num]) {
      const patch = this.textures[num].patch;

      const rVideo = new RVideo({ logical: [1024, 512] });
      rVideo.init(1);
      const iVideo = new IVideo(rVideo);
      iVideo.palette = palette;

      const y = 160;
      for (let i = 0; i < 4; ++i) {
        rVideo.drawPatch(256 * i, y, 0, patch, { flipped: true });
      }

      const data = new Uint8ClampedArray(1024 * 512 * 4);
      iVideo.drawInImageData(data, true);

      const t = new DataTexture(data, 1024, 512, RGBAFormat);
      t.mapping = EquirectangularRefractionMapping;
      t.flipY = true;
      t.needsUpdate = true;
      t.colorSpace = "srgb";

      this.skyTextureCache[num] = t;
    }
    return this.skyTextureCache[num];
  }
}
