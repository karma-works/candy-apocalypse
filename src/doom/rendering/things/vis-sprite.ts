import { ColorMap } from '../../interfaces/colormap';

// A vissprite_t is a thing
//  that will be drawn during a refresh.
// I.e. a sprite object that is partly visible.
export class VisSprite {
  // id from MObj
  id = 0
  // Doubly linked list.
  prev: VisSprite | null = null;
  next: VisSprite | null = null;
  x1 = 0;
  x2 = 0;
  // for line side calculation
  gX = 0;
  gY = 0;
  // global bottom / top for silhouette clipping
  gZ = 0;
  gZt = 0;
  // horizontal position of x1
  startFrac = 0;
  scale = 0;
  // negative if flipped
  xIScale = 0;
  textureMid = 0;
  patch = 0;
  // for color translation and shadow draw,
  //  maxbright frames as well
  colorMap: ColorMap | null = null;
  mobjFlags = 0;
}
