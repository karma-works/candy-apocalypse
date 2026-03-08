import { MapPatch } from './map-patch'
import { tostring } from '../../utils/c'
//
// Texture definition.
// A DOOM wall texture is a list of patches
// which are to be combined in a predefined order.
//
export class MapTexture {
  static sizeOf = 8 + 4 + 2 + 2 + 4 + 2;
  name: string;
  masked: boolean;
  width: number;
  height: number;
  patchCount: number;
  constructor(private buffer: ArrayBuffer) {
    this.name = tostring(buffer, 0, 8)
    const int16 = new Int16Array(buffer, 8, 7)
    this.masked = int16[0] !== 0 && int16[1] !== 0
    this.width = int16[2]
    this.height = int16[3]
    // void **columndirectory; // OBSOLETE
    this.patchCount = int16[6]
  }
  *patches(): Generator<MapPatch, void> {
    for (let i = 0; i < this.patchCount; ++i) {
      yield new MapPatch(this.buffer.slice(MapTexture.sizeOf + i * MapPatch.sizeOf))
    }
  }
}
