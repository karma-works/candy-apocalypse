
//
// Texture definition.
// Each texture is composed of one or more patches,
// with patches being lumps stored in the WAD.
// The lumps are referenced by number, and patched
// into the rectangular texture space using origin
// and possibly other attributes.
//
export class MapPatch {
  static sizeOf = 5 * 2;
  originX: number;
  originY: number;
  patch: number;
  stepDir: number;
  colorMap: number;
  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 5)
    this.originX = int16[0]
    this.originY = int16[1]
    this.patch = int16[2]
    this.stepDir = int16[3]
    this.colorMap = int16[4]
  }
}
