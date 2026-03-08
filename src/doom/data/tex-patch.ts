// A single patch from a texture definition,
//  basically a rectangular area within
//  the texture rectangle.
export class TexPatch {
  // Block origin (allways UL),
  // which has allready accounted
  // for the internal origin of the patch.
  constructor(
    public originX = 0,
    public originY = 0,
    public patch = 0,
  ) { }
}
