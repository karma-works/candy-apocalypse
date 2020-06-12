import { Seg } from './seg'

// Silhouette, needed for clipping Segs (mainly)
// and sprites representing things.
export const SIL_NONE = 0
export const SIL_BOTTOM = 1
export const SIL_TOP = 2
export const SIL_BOTH = 3

export const MAX_DRAW_SEGS = 256

export class DrawSeg {
  curLine: Seg | null = null;
  x1 = 0;
  x2 = 0;
  scale1 = 0;
  scale2 = 0;
  scaleStep = 0;
  // 0=none, 1=bottom, 2=top, 3=both
  silhouette = 0;
  // do not clip sprites above this
  bSilHeight = 0;
  // do not clip sprites below this
  tSilHeight = 0;
  // Pointers to lists for sprite clipping,
  //  all three adjusted so [x1] is first value.
  sprTopClip: null | Int16Array = null
  sprBottomClip: null | Int16Array = null
  maskedTextureCol: null | Int16Array = null
}
