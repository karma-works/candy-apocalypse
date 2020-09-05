import { ANG90, ANGLE_TO_FINE_SHIFT, DBITS, FINE_ANGLES, fineSine, fineTangent, tanToAngle } from '../misc/table'
import { FRACBITS, FRACUNIT, div, mul } from '../misc/fixed'
import { SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { BSP } from './bsp'
import { Data } from './data'
import { Doom } from '../doom'
import { Draw } from './draw'
import { Game } from '../game/game'
import { Level } from '../level/level'
import { LumpReader } from '../wad/lump-reader'
import { Net } from '../doom/net'
import { Plane } from './plane'
import { Player } from '../doom/player'
import { Segs } from './segs'
import { Things } from './things'
import { Tick } from '../play/tick'
import { Video } from './video'
import { pointToAngle } from '../misc/angle'


// Lighting constants.
// Now why not 32 levels here?
export const LIGHT_LEVELS = 16
export const LIGHT_SEG_SHIFT = 4

export const MAX_LIGHT_SCALE = 48
export const LIGHT_SCALE_SHIFT = 12
export const MAX_LIGHT_Z = 128
export const LIGHT_Z_SHIFT = 20

// Number of diminishing brightness levels.
// There a 0-31, i.e. 32 LUT in the COLORMAP lump.
const NUM_COLOR_MAPS = 32

// Fineangles in the SCREENWIDTH wide window.
const FIELD_OF_VIEW = 2048

const DIST_MAP = 2

export class Rendering {
  viewAngleOffset = 0;

  fixedColorMap: Uint8ClampedArray | null = null

  private centerX = 0;
  centerY = 0;

  centerXFrac = 0;
  centerYFrac = 0;
  projection = 0;

  // just for profiling purposes
  private frameCount = 0;

  ssCount = 0;
  private lineCount = 0;
  private loopCount = 0;

  viewX = 0;
  viewY = 0;
  viewZ = 0;

  viewAngle = 0

  viewCos = 0;
  viewSin = 0;

  viewPlayer: Player | null = null

  // 0 = high, 1 = low
  detailShift = 0

  //
  // precalculated math tables
  //
  clipAngle = 0

  // The viewangletox[viewangle + FINEANGLES/4] lookup
  // maps the visible view angles to screen X coordinates,
  // flattening the arc to a flat projection plane.
  // There will be many angles mapped to the same X.
  viewAngleToX = new Array(FINE_ANGLES / 2).fill(0)

  // The xtoviewangleangle[] table maps a screen pixel
  // to the lowest viewangle that maps back to x ranges
  // from clipangle to -clipangle.
  xToViewAngle = new Array(SCREENWIDTH + 1).fill(0)

  scaleLight = Array.from({ length: LIGHT_LEVELS },
    () => Array.from({ length: MAX_LIGHT_SCALE },
      () => new Uint8ClampedArray(0)),
  )
  private scaleLightFixed = Array.from({ length: MAX_LIGHT_SCALE },
    () => new Uint8ClampedArray(0),
  )
  zLight = Array.from({ length: LIGHT_LEVELS },
    () => Array.from({ length: MAX_LIGHT_Z },
      () => new Uint8ClampedArray(0)),
  )

  // bumped light from gun blasts
  extraLight = 0

  colFunc: ((this: Draw) => void) | null = null
  baseColFunc: ((this: Draw) => void) | null = null
  fuzzColFunc: ((this: Draw) => void) | null = null
  transColFunc: ((this: Draw) => void) | null = null
  spanFunc: ((this: Draw) => void) | null = null

  public draw = new Draw(this)
  public plane = new Plane(this)
  public things = new Things(this)
  public segsHandler = new Segs(this)
  public bsp = new BSP(this)

  get data(): Data {
    return this.doom.rData
  }
  get game(): Game {
    return this.doom.game
  }
  get level(): Level {
    return this.doom.play.level
  }
  get net(): Net {
    return this.doom.net
  }
  get tick(): Tick {
    return this.doom.play.tick
  }
  get video(): Video {
    return this.doom.rVideo
  }
  get wad(): LumpReader {
    return this.doom.wad
  }

  constructor(public doom: Doom) { }

  // Blocky mode, has default, 0 = high, 1 = normal
  detailLevel = 0
  screenBlocks = 9
  // temp for screenblocks (0-9)
  screenSize = this.screenBlocks - 3

  pointToAngle(x: number, y: number): number {
    return pointToAngle(this.viewX, this.viewY, x, y)
  }

  pointToDist(x: number, y: number): number {
    let dX = Math.abs(x - this.viewX)
    let dY = Math.abs(y - this.viewY)

    if (dY > dX) {
      const temp = dX
      dX = dY
      dY = temp
    }

    const angle = tanToAngle[div(dY, dX) >> DBITS] + ANG90
      >> ANGLE_TO_FINE_SHIFT

    // use as cosine
    return div(dX, fineSine[angle])
  }

  //
  // R_ScaleFromGlobalAngle
  // Returns the texture mapping scale
  //  for the current line (horizontal span)
  //  at the given angle.
  // rw_distance must be calculated first.
  //
  scaleFromGlobalAngle(visAngle: number): number {
    const angleA = ANG90 + visAngle - this.viewAngle >>> 0
    const angleB = ANG90 + visAngle - this.segsHandler.rwNormalAngle >>> 0

    // both sines are allways positive
    const sineA = fineSine[angleA >> ANGLE_TO_FINE_SHIFT]
    const sineB = fineSine[angleB >> ANGLE_TO_FINE_SHIFT]
    const num = mul(this.projection, sineB) << this.detailShift
    const den = mul(this.segsHandler.rwDistance, sineA)

    let scale: number
    if (den > num >> 16) {
      scale = div(num, den)

      if (scale > 64 * FRACUNIT) {
        scale = 64 * FRACUNIT
      } else if (scale < 256) {
        scale = 256
      }
    } else {
      scale = 64 * FRACUNIT
    }

    return scale
  }

  //
  // R_InitTextureMapping
  //
  private initTextureMapping(): void {
    // Use tangent table to generate viewangletox:
    //  viewangletox will give the next greatest x
    //  after the view angle.
    //
    // Calc focallength
    //  so FIELDOFVIEW angles covers SCREENWIDTH.
    const focalLength = div(this.centerXFrac,
      fineTangent[FINE_ANGLES / 4 + FIELD_OF_VIEW / 2])

    let i: number
    let t: number
    for (i = 0; i < FINE_ANGLES / 2; ++i) {
      if (fineTangent[i] > FRACUNIT * 2) {
        t = -1
      } else if (fineTangent[i] < -FRACUNIT * 2) {
        t = this.draw.viewWidth + 1
      } else {
        t = mul(fineTangent[i], focalLength)
        t = this.centerXFrac - t + FRACUNIT - 1 >> FRACBITS

        if (t < -1) {
          t = -1
        } else if (t > this.draw.viewWidth + 1) {
          t = this.draw.viewWidth +1
        }
      }
      this.viewAngleToX[i] = t
    }

    // Scan viewangletox[] to generate xtoviewangle[]:
    //  xtoviewangle will give the smallest view angle
    //  that maps to x.
    for (let x = 0; x <= this.draw.viewWidth; ++x) {
      i = 0
      while (this.viewAngleToX[i] > x) {
        ++i
      }
      this.xToViewAngle[x] = (i << ANGLE_TO_FINE_SHIFT) - ANG90 >>> 0
    }

    // Take out the fencepost cases from viewangletox.
    for (i = 0; i < FINE_ANGLES / 2; ++i) {
      t = mul(fineTangent[i], focalLength)
      t = this.centerX - t

      if (this.viewAngleToX[i] === -1) {
        this.viewAngleToX[i] = 0
      } else if (this.viewAngleToX[i] === this.draw.viewWidth + 1) {
        this.viewAngleToX[i] = this.draw.viewWidth
      }
    }

    this.clipAngle = this.xToViewAngle[0]
  }

  //
  // R_InitLightTables
  // Only inits the zlight table,
  //  because the scalelight table changes with view size.
  //
  initLightTables(): void {
    // Calculate the light levels to use
    //  for each level / distance combination.
    let startMap: number
    let j: number
    let scale: number
    let level: number
    for (let i = 0; i < LIGHT_LEVELS; ++i) {
      startMap = (LIGHT_LEVELS - 1 -i) * 2 * NUM_COLOR_MAPS / LIGHT_LEVELS
      for (j = 0; j < MAX_LIGHT_Z; ++j) {
        scale = div(SCREENWIDTH / 2 * FRACUNIT, j + 1 << LIGHT_Z_SHIFT)
        scale >>= LIGHT_SCALE_SHIFT
        level = startMap - (scale / DIST_MAP >> 0)

        if (level < 0) {
          level = 0
        }

        if (level >= NUM_COLOR_MAPS) {
          level = NUM_COLOR_MAPS - 1
        }

        this.zLight[i][j] = this.data.colorMaps.subarray(level * 256)
      }
    }
  }

  //
  // R_SetViewSize
  // Do not really change anything here,
  //  because it might be in the middle of a refresh.
  // The change will take effect next refresh.
  //
  setSizeNeeded = false
  private setBlocks = 0
  private setDetail = 0

  setViewSize(blocks: number, detail: number): void {
    this.setSizeNeeded = true
    this.setBlocks = blocks
    this.setDetail = detail
  }

  //
  // R_ExecuteSetViewSize
  //
  executeSetViewSize(): void {
    this.setSizeNeeded = false

    if (this.setBlocks === 11) {
      this.draw.scaledViewWidth = SCREENWIDTH
      this.draw.viewHeight = SCREENHEIGHT
    } else {
      this.draw.scaledViewWidth = this.setBlocks * 32
      this.draw.viewHeight = this.setBlocks * 168 / 10 & ~7
    }

    this.detailShift = this.setDetail
    this.draw.viewWidth = this.draw.scaledViewWidth >> this.detailShift

    this.centerY = this.draw.viewHeight / 2
    this.centerX = this.draw.viewWidth / 2
    this.centerXFrac = this.centerX << FRACBITS
    this.centerYFrac = this.centerY << FRACBITS
    this.projection = this.centerXFrac

    if (!this.detailShift) {
      this.colFunc = this.baseColFunc = this.draw.drawColumn
      this.fuzzColFunc = this.draw.drawFuzzColumn
      this.transColFunc = this.draw.drawTranslatedColumn
      this.spanFunc = this.draw.drawSpan
    } else {
      this.colFunc = this.baseColFunc = this.draw.drawColumnLow
      this.fuzzColFunc = this.draw.drawFuzzColumnLow
      this.transColFunc = this.draw.drawTranslatedColumnLow
      this.spanFunc = this.draw.drawSpanLow
    }

    this.draw.initBuffer(this.draw.scaledViewWidth, this.draw.viewHeight)

    this.initTextureMapping()

    // psprite scales
    this.things.pSpriteScale = FRACUNIT * this.draw.viewWidth / SCREENWIDTH >> 0
    this.things.pSpriteIScale = FRACUNIT * SCREENWIDTH / this.draw.viewWidth >> 0

    // thing clipping
    for (let i = 0; i < this.draw.viewWidth; ++i) {
      this.things.screenHeightArray[i] = this.draw.viewHeight
    }

    // planes
    let dy: number
    for (let i = 0; i < this.draw.viewHeight; ++i) {
      dy = (i - this.draw.viewHeight / 2 << FRACBITS) + FRACUNIT / 2
      dy = Math.abs(dy)
      this.plane.ySlope[i] = div(
        (this.draw.viewWidth << this.detailShift) / 2 * FRACUNIT,
        dy,
      )
    }

    let cosAdj: number
    for (let i = 0; i < this.draw.viewWidth; ++i) {
      cosAdj = Math.abs(
        fineSine[FINE_ANGLES / 4 + (this.xToViewAngle[i] >> ANGLE_TO_FINE_SHIFT)],
      )
      this.plane.distScale[i] = div(FRACUNIT, cosAdj)
    }

    // Calculate the light levels to use
    //  for each level / scale combination.
    let startMap: number
    let j: number
    let level: number
    for (let i = 0; i < LIGHT_LEVELS; ++i) {
      startMap = (LIGHT_LEVELS - 1 - i) * 2 * NUM_COLOR_MAPS / LIGHT_LEVELS
      for (j = 0; j < MAX_LIGHT_SCALE; ++j) {
        level = startMap - (j * SCREENWIDTH /
            (this.draw.viewWidth << this.detailShift) /
            DIST_MAP >> 0)

        if (level < 0) {
          level = 0
        }

        if (level >= NUM_COLOR_MAPS) {
          level = NUM_COLOR_MAPS - 1
        }

        this.scaleLight[i][j] = this.data.colorMaps.subarray(level * 256)
      }
    }
  }

  init(): void {

    this.data.initData()
    console.log('R_InitData')
    // this.initPointToAngle()
    console.log('R_InitPointToAngle')
    // this.initTables()
    // viewwidth / viewheight / detailLevel are set by the defaults
    console.log('R_InitTables')

    this.setViewSize(this.screenBlocks, this.detailLevel)
    // this.plane.initPlanes()
    console.log('R_InitPlanes')
    this.initLightTables()
    console.log('R_InitLightTables')
    this.draw.initTranslationTables()
    console.log('R_InitTranslationsTables')

    this.things.initSprites()

    this.frameCount = 0
  }

  //
  // R_SetupFrame
  //
  private setupFrame(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    this.viewPlayer = player
    this.viewX = player.mo.x
    this.viewY = player.mo.y
    this.viewAngle = player.mo.angle + this.viewAngleOffset >>> 0
    this.extraLight = player.extraLight

    this.viewZ = player.viewZ

    this.viewSin = fineSine[this.viewAngle >>> ANGLE_TO_FINE_SHIFT]
    this.viewCos = fineSine[FINE_ANGLES / 4 + (this.viewAngle >>> ANGLE_TO_FINE_SHIFT)]

    this.ssCount = 0

    if (player.fixedColorMap) {
      this.fixedColorMap = this.data.colorMaps.subarray(player.fixedColorMap * 256)

      this.segsHandler.wallLights = this.scaleLightFixed
      for (let i = 0; i < MAX_LIGHT_SCALE; ++i) {
        this.scaleLightFixed[i] = this.fixedColorMap
      }
    } else {
      this.fixedColorMap = null
    }

    this.frameCount++
  }

  //
  // R_RenderView
  //
  renderPlayerView(player: Player): void {
    this.setupFrame(player)

    // Clear buffers.
    this.bsp.clearClipSegs()
    this.bsp.clearDrawSegs()
    this.plane.clearPlanes()
    this.things.clearSprites()

    // check for new console commands.
    this.net.netUpdate()

    // The head node is the last node output.
    this.bsp.renderBSPNode(this.level.nodes.length - 1)

    // Check for new console commands.
    this.net.netUpdate()

    this.plane.drawPlanes()

    // Check for new console commands.
    this.net.netUpdate()

    this.things.drawMasked()

    // Check for new console commands.
    this.net.netUpdate()
  }
}
