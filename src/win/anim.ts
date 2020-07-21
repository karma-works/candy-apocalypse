import { Patch } from '../rendering/defs/patch'
import { Point } from './point'
import { TICRATE } from '../global/doomdef'

export const enum AnimType {
  Always,
  Random,
  Level,
}

//
// Animation.
// There is another anim_t used in p_spec.
//
export class Anim {

  // actual graphics for frames of animations
  p = new Array<Patch>()

  // following must be initialized to zero before use!

  // next value of bcnt (used in conjunction with period)
  nextTic = 0

  // last drawn animation frame
  lastDrawn = 0

  // next frame number to animate
  ctr = 0

  // used by RANDOM and LEVEL when animating
  state = 0

  constructor(
    public type: AnimType,
    // period in tics between animations
    public period: number,
    // number of animation frames
    public nAnims: number,
    // location of animation
    public loc: Point,

    // ALWAYS: n/a,
    // RANDOM: period deviation (<256),
    // LEVEL: level
    public data1 = 0,

    // ALWAYS: n/a,
    // RANDOM: random base period,
    // LEVEL: n/a
    public data2 = 0,
  ) { }
}

//
// Animation locations for episode 0 (1).
// Using patches saves a lot of space,
//  as they replace 320x200 full screen frames.
//
export const episode0AnimInfo = [
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 224, y: 104 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 184, y: 160 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 112, y: 136 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 72, y: 112 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 88, y: 96 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 64, y: 48 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 192, y: 40 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 136, y: 16 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 80, y: 16 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 64, y: 24 }),
]

export const episode1AnimInfo = [
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 1),
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 2),
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 3),
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 4),
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 5),
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 6),
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 7),
  new Anim(AnimType.Level, TICRATE / 3, 3, { x: 192, y: 144 }, 8),
  new Anim(AnimType.Level, TICRATE / 3, 1, { x: 128, y: 136 }, 8),
]

export const episode2AnimInfo = [
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 104, y: 168 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 40, y: 136 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 160, y: 96 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 104, y: 80 }),
  new Anim(AnimType.Always, TICRATE / 3, 3, { x: 120, y: 32 }),
  new Anim(AnimType.Always, TICRATE / 4, 3, { x: 40, y: 0 }),
]

export const NUM_ANIMS = [
  episode0AnimInfo.length,
  episode1AnimInfo.length,
  episode2AnimInfo.length,
]

export const anims = [
  episode0AnimInfo,
  episode1AnimInfo,
  episode2AnimInfo,
]
