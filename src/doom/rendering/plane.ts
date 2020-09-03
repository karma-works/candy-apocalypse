import { ANG90, ANGLE_TO_FINE_SHIFT, FINE_ANGLES, fineSine } from '../misc/table'
import { ANGLE_TO_SKY_SHIFT, Sky } from './sky'
import { LIGHT_LEVELS, LIGHT_SEG_SHIFT, LIGHT_Z_SHIFT, MAX_LIGHT_Z, Rendering } from './rendering'
import { RANGE_CHECK, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { div, mul } from '../misc/fixed'
import { BSP } from './bsp'
import { Data } from './data'
import { Draw } from './draw'
import { LumpReader } from '../wad/lump-reader'
import { MAX_DRAW_SEGS } from './defs/draw-seg'
import { Things } from './things'
import { VisPlane } from './plane/vis-plane'

export type PlaneFunction = (top: number, bottom: number) => void

// Here comes the obnoxious "visplane".
export const MAX_VISPLANES = 128

// ?
export const MAX_OPENINGS = SCREENWIDTH * 64

export class Plane {


  private floorFunc: PlaneFunction | null = null
  private ceilingFunc: PlaneFunction | null = null

  //
  // opening
  //

  // Here comes the obnoxious "visplane".
  private visPlanes = Array.from({ length: MAX_VISPLANES }, () => new VisPlane())
  private lastVisPlanePtr = -1
  floorPlane: VisPlane | null = null
  ceilingPlane: VisPlane | null = null

  // Add SCREENWIDTH for underflow and overflow
  openings = new Int16Array(SCREENWIDTH * 2 + MAX_OPENINGS)
  lastOpeningPtr = 0

  //
  // Clip values are the solid pixel bounding the range.
  //  floorclip starts out SCREENHEIGHT
  //  ceilingclip starts out -1
  //
  floorClip = new Int16Array(SCREENWIDTH).fill(0)
  ceilingClip = new Int16Array(SCREENWIDTH).fill(0)

  //
  // spanstart holds the start of a plane span
  // initialized to 0 at start
  //
  private spanStart = new Array<number>(SCREENHEIGHT).fill(0)
  private spanStop = new Array<number>(SCREENHEIGHT).fill(0)

  //
  // texture mapping
  //
  private planeZLight = new Array<Uint8ClampedArray>()
  private planeHeight = 0

  ySlope = new Array<number>(SCREENHEIGHT).fill(0)
  distScale = new Array<number>(SCREENWIDTH).fill(0)
  private baseXScale = 0
  private baseYScale = 0

  private cachedHeight = new Array<number>(SCREENHEIGHT).fill(0)
  private cachedDistance = new Array<number>(SCREENHEIGHT).fill(0)
  private cachedXStep = new Array<number>(SCREENHEIGHT).fill(0)
  private cachedYStep = new Array<number>(SCREENHEIGHT).fill(0)

  private get bsp(): BSP {
    return this.rendering.bsp
  }
  private get data(): Data {
    return this.rendering.data
  }
  private get draw(): Draw {
    return this.rendering.draw
  }
  private get sky(): Sky {
    return this.rendering.sky
  }
  private get things(): Things {
    return this.rendering.things
  }
  private get wad(): LumpReader {
    return this.rendering.wad
  }

  constructor(private rendering: Rendering) { }

  //
  // R_MapPlane
  //
  // Uses global vars:
  //  planeheight
  //  ds_source
  //  basexscale
  //  baseyscale
  //  viewx
  //  viewy
  //
  // BASIC PRIMITIVE
  //
  mapPlane(y: number, x1: number, x2: number): void {

    if (RANGE_CHECK) {
      if (x2 < x1 ||
          x1 < 0 ||
          x2 >= this.draw.viewWidth ||
          y >>> 0 > this.draw.viewHeight
      ) {
        throw `R_MapPlane: ${x1}, ${x2} at ${y}`
      }
    }

    let distance: number
    if (this.planeHeight !== this.cachedHeight[y]) {
      this.cachedHeight[y] = this.planeHeight
      distance = this.cachedDistance[y] =
        mul(this.planeHeight, this.ySlope[y])
      this.draw.dsXStep = this.cachedXStep[y] =
        mul(distance, this.baseXScale)
      this.draw.dsYStep = this.cachedYStep[y] =
        mul(distance, this.baseYScale)
    } else {
      distance = this.cachedDistance[y]
      this.draw.dsXStep = this.cachedXStep[y]
      this.draw.dsYStep = this.cachedYStep[y]
    }

    const length = mul(distance, this.distScale[x1])
    const angle = this.rendering.viewAngle + this.rendering.xToViewAngle[x1] >>> ANGLE_TO_FINE_SHIFT
    this.draw.dsXFrac = this.rendering.viewX + mul(fineSine[FINE_ANGLES / 4 + angle], length)
    this.draw.dsYFrac = -this.rendering.viewY - mul(fineSine[angle], length)

    if (this.rendering.fixedColorMap) {
      this.draw.dsColorMap = this.rendering.fixedColorMap
    } else {
      let index = distance >> LIGHT_Z_SHIFT

      if (index >= MAX_LIGHT_Z) {
        index = MAX_LIGHT_Z - 1
      }
      this.draw.dsColorMap = this.planeZLight[index]
    }

    this.draw.dsY = y
    this.draw.dsX1 = x1
    this.draw.dsX2 = x2

    // high or low detail
    if (this.rendering.spanFunc === null) {
      throw 'this.rendering.spanFunc = null'
    }
    this.rendering.spanFunc.apply(this.draw)
  }


  //
  // R_ClearPlanes
  // At begining of frame.
  //
  clearPlanes(): void {
    // opening / clipping determination
    for (let i = 0; i < this.draw.viewWidth; ++i) {
      this.floorClip[i] = this.draw.viewHeight
      this.ceilingClip[i] = -1
    }

    this.lastVisPlanePtr = 0
    this.lastOpeningPtr = 0

    // texture calculation
    this.cachedHeight.fill(0)

    // left to right mapping
    const angle = this.rendering.viewAngle - ANG90
        >>> ANGLE_TO_FINE_SHIFT

    // scale will be unit scale at SCREENWIDTH/2 distance
    this.baseXScale = div(fineSine[FINE_ANGLES / 4 + angle], this.rendering.centerXFrac)
    this.baseYScale = -div(fineSine[angle], this.rendering.centerXFrac)
  }

  //
  // R_FindPlane
  //
  findPlane(height: number, picNum: number, lightLevel: number): VisPlane {
    if (picNum === this.sky.skyFlatNum) {
      // all skys map together
      height = 0
      lightLevel = 0
    }

    let checkPtr: number
    let check: VisPlane
    for (checkPtr = 0, check = this.visPlanes[checkPtr];
      checkPtr < this.lastVisPlanePtr;
      checkPtr++, check = this.visPlanes[checkPtr]
    ) {
      if (height === check.height &&
        picNum === check.picNum &&
        lightLevel === check.lightLevel
      ) {
        break
      }
    }

    if (checkPtr < this.lastVisPlanePtr) {
      return check
    }

    if (this.lastVisPlanePtr === MAX_VISPLANES) {
      throw 'R_FindPlane: no more visplanes'
    }

    this.lastVisPlanePtr++

    check.height = height
    check.picNum = picNum
    check.lightLevel = lightLevel
    check.minX = SCREENWIDTH
    check.maxX = -1

    check.top.fill(0xffff)

    return check
  }

  //
  // R_CheckPlane
  //
  checkPlane(pl: VisPlane, start: number, stop: number): VisPlane {
    let intrl: number
    let intrh: number
    let unionl: number
    let unionh: number
    if (start < pl.minX) {
      intrl = pl.minX
      unionl = start
    } else {
      unionl = pl.minX
      intrl = start
    }

    if (stop > pl.maxX) {
      intrh = pl.maxX
      unionh = stop
    } else {
      unionh = pl.maxX
      intrh = stop
    }

    let x: number
    for (x = intrl; x <= intrh; ++x) {
      if (pl.top[x] !== 0xffff) {
        break
      }
    }

    if (x > intrh) {
      pl.minX = unionl
      pl.maxX = unionh

      // use the same one
      return pl
    }

    // make a new visplane
    const lastVisplane = this.visPlanes[this.lastVisPlanePtr]
    lastVisplane.height = pl.height
    lastVisplane.picNum = pl.picNum
    lastVisplane.lightLevel = pl.lightLevel

    pl = this.visPlanes[this.lastVisPlanePtr++]
    pl.minX = start
    pl.maxX = stop

    pl.top.fill(0xffff)

    return pl
  }

  //
  // R_MakeSpans
  //
  makeSpans(x: number, t1: number, b1: number, t2: number, b2: number): void {
    // console.log(`ms ${x} ${t1} ${b1} ${t2} ${b2}`)
    while (t1 < t2 && t1 <= b1) {
      this.mapPlane(t1, this.spanStart[t1], x - 1)
      ++t1
    }
    while (b1 > b2 && b1 >= t1) {
      this.mapPlane(b1, this.spanStart[b1], x - 1)
      --b1
    }

    while (t2 < t1 && t2 <= b2) {
      this.spanStart[t2] = x
      ++t2
    }
    while (b2 > b1 && b2 >= t2) {
      this.spanStart[b2] = x
      --b2
    }
  }

  //
  // R_DrawPlanes
  // At the end of each frame.
  //
  drawPlanes(): void {

    if (RANGE_CHECK) {
      if (this.bsp.dsP > MAX_DRAW_SEGS) {
        throw `R_DrawPlanes: drawsegs overflow (${this.bsp.dsP})`
      }
      if (this.lastVisPlanePtr > MAX_VISPLANES) {
        throw `R_DrawPlanes: visplane overflow (${this.lastVisPlanePtr})`
      }
      if (this.lastOpeningPtr > MAX_OPENINGS) {
        throw `R_DrawPlanes: opening overflow (${this.lastOpeningPtr})`
      }

    }

    let pl: VisPlane
    let light: number
    let x: number
    let stop: number
    let angle: number
    for (let plPtr = 0; plPtr < this.lastVisPlanePtr; ++plPtr) {
      pl = this.visPlanes[plPtr]
      if (pl.minX > pl.maxX) {
        continue
      }

      // sky flat
      if (pl.picNum === this.sky.skyFlatNum) {
        this.draw.dcIScale = this.things.pSpriteIScale >> this.rendering.detailShift

        // Sky is allways drawn full bright,
        //  i.e. colormaps[0] is used.
        // Because of this hack, sky is not affected
        //  by INVUL inverse mapping.
        this.draw.dcColorMap = this.data.colorMaps
        this.draw.dcTextureMid = this.sky.skyTextureMid
        for (x = pl.minX; x <= pl.maxX; ++x) {
          this.draw.dcYl = pl.top[x]
          this.draw.dcYh = pl.bottom[x]

          if (this.draw.dcYl <= this.draw.dcYh) {
            angle = this.rendering.viewAngle + this.rendering.xToViewAngle[x] >> ANGLE_TO_SKY_SHIFT
            this.draw.dcX = x
            this.draw.dcSource =
              this.data.textures.getColumn(this.sky.skyTexture, angle).posts[0]

            if (this.rendering.colFunc === null) {
              throw 'this.rendering.colFunc = null'
            }
            this.rendering.colFunc.apply(this.draw)
          }
        }
        continue
      }

      // regular flat
      this.draw.dsSource = this.data.flats.get(pl.picNum)

      this.planeHeight = Math.abs(pl.height - this.rendering.viewZ)
      light = (pl.lightLevel >> LIGHT_SEG_SHIFT) + this.rendering.extraLight

      if (light >= LIGHT_LEVELS) {
        light = LIGHT_LEVELS - 1
      }

      if (light < 0) {
        light = 0
      }

      this.planeZLight = this.rendering.zLight[light]

      pl.top[pl.maxX + 1] = 0xffff
      pl.top[pl.minX - 1] = 0xffff

      stop = pl.maxX + 1

      for (x = pl.minX; x <= stop; ++x) {
        this.makeSpans(
          x,
          pl.top[x - 1],
          pl.bottom[x - 1],
          pl.top[x],
          pl.bottom[x],
        )
      }
    }
  }

}
