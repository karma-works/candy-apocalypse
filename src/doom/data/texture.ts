import { TexPatch } from './tex-patch'
// A maptexturedef_t describes a rectangular texture,
//  which is composed of one or more mappatch_t structures
//  that arrange graphic patches.
export class Texture {
  // Keep name for switch changing, etc.
  // All the patches[patchcount]
  //  are drawn back to front into the cached texture.
  patches: TexPatch[]

  constructor(public name: string = '',
              public width: number = 0,
              public height: number = 0,
              public patchCount: number = 0) {
    this.patches = Array.from(
      { length: patchCount },
      () => new TexPatch(),
    )
  }
}
