// A single patch from a texture definition,
//  basically a rectangular area within
//  the texture rectangle.
export class TexPatch {
  // Block origin (allways UL),
  // which has allready accounted
  // for the internal origin of the patch.
  originX = 0
  originY = 0
  patch = 0
}
