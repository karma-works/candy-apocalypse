import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  RepeatWrapping,
} from "three";
import { Video as RVideo } from "../../rendering/video";
import { SpriteArray } from "../../sprites/sprite-array";
import { SpriteDef } from "../../sprites/sprite-defs-array";

export class SpriteTexture extends DataTexture {
  rotations: number;
  frames: number;

  width: number;
  height: number;
  bottomOffset: number;

  constructor(sprDef: SpriteDef, sprites: SpriteArray) {
    const [top, right, bottom, left] = getBoundingBox(sprDef, sprites);

    const rotations = 8;
    const frames = sprDef.frames.length;

    const width = right - left;
    const height = bottom - top;

    const data = drawPatches(
      sprDef,
      sprites,
      width,
      height,
      -top,
      rotations,
      frames,
    );
    super(data, width * rotations, height * frames, RGBAFormat);

    this.rotations = rotations;
    this.frames = frames;
    this.width = width;
    this.height = height;
    this.bottomOffset = bottom;

    this.flipY = true;

    this.wrapS = RepeatWrapping;
    this.wrapT = RepeatWrapping;

    this.magFilter = LinearFilter;
    this.minFilter = LinearMipmapLinearFilter;
    this.generateMipmaps = true;
  }
}

function drawPatches(
  sprDef: SpriteDef,
  sprites: SpriteArray,
  width: number,
  height: number,
  baseLine: number,
  rotations: number,
  frames: number,
) {
  const rVideo = new RVideo({ logical: [width * rotations, height * frames] });
  rVideo.init(1);

  sprDef.frames.forEach((f, fId) => {
    f.lump.forEach((num, rId) => {
      const flipped = !!f.flip[rId];
      const patch = sprites[num].patch;

      rVideo.drawPatch(
        width * rId + width / 2,
        height * fId + baseLine,
        0,
        patch,
        { flipped },
      );
    });
  });

  // Mapped to RGBA, but only Red and Alpha are used.
  // Red channel is palette index
  const source = rVideo.screens[0];
  const data = new Uint8ClampedArray(source.length * 4);
  for (let i = 0; i < source.length; ++i) {
    data[i * 4 + 0] = source[i];
    data[i * 4 + 3] = source.alpha[i];
  }
  return data;
}

function getBoundingBox(sprDef: SpriteDef, sprites: SpriteArray) {
  let top = Infinity,
    right = 0,
    bottom = -Infinity,
    left = 0;

  sprDef.frames.forEach((f) => {
    f.lump.forEach((num) => {
      const patch = sprites[num].patch;

      left = Math.min(-patch.leftOffset, left);
      top = Math.min(-patch.topOffset, top);

      right = Math.max(patch.width - patch.leftOffset, right);
      bottom = Math.max(patch.height - patch.topOffset, bottom);
    });
  });

  right = Math.max(-left, right);
  left = -right;

  return [top, right, bottom, left];
}
