import { ANG180, ANG90, ANGLE_TO_FINE_SHIFT, fineSine, fineTangent } from '../misc/table'
import { DrawSeg, MAX_DRAW_SEGS, SIL_BOTH, SIL_BOTTOM, SIL_TOP } from './defs/draw-seg'
import { FRACBITS, mul } from '../misc/fixed'
import { LIGHT_LEVELS, LIGHT_SCALE_SHIFT, LIGHT_SEG_SHIFT, MAX_LIGHT_SCALE, Rendering } from './rendering'
import { RANGE_CHECK, SCREENWIDTH } from '../global/doomdef'
import { BSP } from './bsp'
import { Column } from './defs/column'
import { Data } from './data'
import { Draw } from './draw'
import { Level } from '../level/level'
import { MapLineFlag } from '../doom/data'
import { Plane } from './plane'
import { Things } from './things'

const HEIGHT_BITS = 12
const HEIGHT_UNIT = 1 << HEIGHT_BITS

export class Segs {

  // OPTIMIZE: closed two sided lines as single sided

  // True if any of the segs textures might be visible.
  private segTextured = 0;

  // False if the back side is the same plane.
  private markFloor = false;
  private markCeiling = false;

  private maskedTexture = 0;
  private topTexture = 0;
  private bottomTexture = 0;
  private midTexture = 0;


  rwNormalAngle = 0
  // angle to line origin
  rwAngle1 = 0;

  //
  // regular wall
  //
  private rwX = 0;
  private rwStopX = 0;
  private rwCenterAngle = 0
  private rwOffset = 0
  rwDistance = 0
  private rwScale = 0
  private rwScaleStep = 0
  private rwMidTextureMid = 0
  private rwTopTextureMid = 0
  private rwBottomTextureMid = 0

  private worldTop = 0
  private worldBottom = 0
  private worldHigh = 0
  private worldLow = 0

  private pixHigh = 0
  private pixLow = 0
  private pixHighStep = 0
  private pixLowStep = 0

  private topFrac = 0
  private topStep = 0

  private bottomFrac = 0
  private bottomStep = 0

  wallLights = new Array<Uint8ClampedArray>()

  private maskedTextureCol: null | Int16Array = null

  private get bsp(): BSP {
    return this.rendering.bsp
  }
  private get data(): Data {
    return this.rendering.data
  }
  private get draw(): Draw {
    return this.rendering.draw
  }
  private get level(): Level {
    return this.rendering.level
  }
  private get plane(): Plane {
    return this.rendering.plane
  }
  private get things(): Things {
    return this.rendering.things
  }
  constructor(private rendering: Rendering) { }

  //
  // R_RenderMaskedSegRange
  //
  renderMaskedSegRange(ds: DrawSeg, x1: number, x2: number): void {
    // Calculate light table.
    // Use different light tables
    //   for horizontal / vertical / diagonal. Diagonal?
    // OPTIMIZE: get rid of LIGHTSEGSHIFT globally
    if (ds.curLine === null) {
      throw 'ds.curLine = null'
    }

    const curLine = ds.curLine
    this.bsp.curLine = curLine
    this.bsp.frontSector = curLine.frontSector
    this.bsp.backSector = curLine.backSector
    const textNum = this.data.textures.getNum(curLine.sideDef.midTexture)

    let lightNum = (this.bsp.frontSector.lightLevel >> LIGHT_SEG_SHIFT) + this.rendering.extraLight

    if (curLine.v1.y === curLine.v2.y) {
      --lightNum
    } else if (curLine.v1.x === curLine.v2.x) {
      ++lightNum
    }

    if (lightNum < 0) {
      this.wallLights = this.rendering.scaleLight[0]
    } else if (lightNum >= LIGHT_LEVELS) {
      this.wallLights = this.rendering.scaleLight[LIGHT_LEVELS - 1]
    } else {
      this.wallLights = this.rendering.scaleLight[lightNum]
    }

    if (ds.maskedTextureCol === null) {
      throw 'ds.maskedTextureCol = null'
    }
    this.maskedTextureCol = ds.maskedTextureCol


    this.rwScaleStep = ds.scaleStep
    this.things.sprYScale = ds.scale1 + (x1 - ds.x1) * this.rwScaleStep
    this.things.mFloorClip = ds.sprBottomClip
    this.things.mCeilingClip = ds.sprTopClip

    // find positioning
    if (this.bsp.backSector === null) {
      throw 'this.bsp.backSector = null'
    }
    if (curLine.lineDef.flags & MapLineFlag.DontPegBottom) {
      this.draw.dcTextureMid =
        this.bsp.frontSector.floorHeight > this.bsp.backSector.floorHeight ?
          this.bsp.frontSector.floorHeight : this.bsp.backSector.floorHeight

      this.draw.dcTextureMid = this.draw.dcTextureMid +
        this.data.textures.getHeight(textNum) -
        this.rendering.viewZ
    } else {
      this.draw.dcTextureMid =
        this.bsp.frontSector.ceilingHeight < this.bsp.backSector.ceilingHeight ?
          this.bsp.frontSector.ceilingHeight : this.bsp.backSector.ceilingHeight

      this.draw.dcTextureMid = this.draw.dcTextureMid - this.rendering.viewZ
    }
    this.draw.dcTextureMid += curLine.sideDef.rowOffset

    if (this.rendering.fixedColorMap) {
      this.draw.dcColorMap = this.rendering.fixedColorMap
    }

    // draw the columns
    let index: number
    let col: Column
    for (this.draw.dcX = x1; this.draw.dcX <= x2; ++this.draw.dcX) {
      // calculate lighting
      if (this.maskedTextureCol[this.draw.dcX] !== 0x7fff) {
        if (!this.rendering.fixedColorMap) {
          index = this.things.sprYScale >> LIGHT_SCALE_SHIFT

          if (index >= MAX_LIGHT_SCALE) {
            index = MAX_LIGHT_SCALE - 1
          }

          this.draw.dcColorMap = this.wallLights[index]
        }

        this.things.sprTopScreen = this.rendering.centerYFrac -
          mul(this.draw.dcTextureMid, this.things.sprYScale)
        this.draw.dcIScale = 0xffffffff / this.things.sprYScale >>> 0

        // draw the texture
        col = this.data.textures.getColumn(
          textNum,
          this.maskedTextureCol[this.draw.dcX],
        )

        this.things.drawMaskedColumn(col)
        this.maskedTextureCol[this.draw.dcX] = 0x7fff
      }
      this.things.sprYScale += this.rwScaleStep
    }
  }

  //
  // R_RenderSegLoop
  // Draws zero, one, or two textures (and possibly a masked
  //  texture) for walls.
  // Can draw or mark the starting pixel of floor and ceiling
  //  textures.
  // CALLED: CORE LOOPING ROUTINE.
  //
  renderSegLoop(): void {
    if (this.rendering.colFunc === null) {
      throw 'this.rendering.colFunc = null'
    }

    let angle: number
    let index: number
    let yl: number
    let yh: number
    let mid: number
    let textureColumn = 0
    let top: number
    let bottom: number
    for (; this.rwX < this.rwStopX; ++this.rwX) {
      // mark floor / ceiling areas
      yl = this.topFrac + HEIGHT_UNIT - 1 >> HEIGHT_BITS

      // no space above wall?
      if (yl < this.plane.ceilingClip[this.rwX] + 1) {
        yl = this.plane.ceilingClip[this.rwX] + 1
      }

      if (this.markCeiling) {
        top = this.plane.ceilingClip[this.rwX] + 1
        bottom = yl - 1

        if (bottom >= this.plane.floorClip[this.rwX]) {
          bottom = this.plane.floorClip[this.rwX] - 1
        }

        if (top <= bottom) {
          if (this.plane.ceilingPlane === null) {
            throw 'this.plane.ceilingPlane = null'
          }
          this.plane.ceilingPlane.top[this.rwX] = top
          this.plane.ceilingPlane.bottom[this.rwX] = bottom
        }
      }

      yh = this.bottomFrac >> HEIGHT_BITS

      if (yh >= this.plane.floorClip[this.rwX]) {
        yh = this.plane.floorClip[this.rwX] - 1
      }

      if (this.markFloor) {
        top = yh + 1
        bottom = this.plane.floorClip[this.rwX] - 1

        if (top <= this.plane.ceilingClip[this.rwX]) {
          top = this.plane.ceilingClip[this.rwX] + 1
        }

        if (top <= bottom) {
          if (this.plane.floorPlane === null) {
            throw 'this.plane.floorPlane = null'
          }
          this.plane.floorPlane.top[this.rwX] = top
          this.plane.floorPlane.bottom[this.rwX] = bottom
        }
      }

      // texturecolumn and lighting are independent of wall tiers
      if (this.segTextured) {
        // calculate texture offset
        angle = this.rwCenterAngle + this.rendering.xToViewAngle[this.rwX] >> ANGLE_TO_FINE_SHIFT
        textureColumn = this.rwOffset - mul(fineTangent[angle], this.rwDistance)
        textureColumn >>= FRACBITS
        // calculate lighting
        index = this.rwScale >> LIGHT_SCALE_SHIFT

        if (index >= MAX_LIGHT_SCALE) {
          index = MAX_LIGHT_SCALE - 1
        }

        this.draw.dcColorMap = this.wallLights[index]
        this.draw.dcX = this.rwX
        this.draw.dcIScale = 0xffffffff / this.rwScale >>> 0
      }

      // draw the wall tiers
      if (this.midTexture) {
        // single sided line
        this.draw.dcYl = yl
        this.draw.dcYh = yh
        this.draw.dcTextureMid = this.rwMidTextureMid
        this.draw.dcSource =
          this.data.textures.getColumn(this.midTexture, textureColumn).posts[0]
        this.rendering.colFunc.apply(this.draw)
        this.plane.ceilingClip[this.rwX] = this.draw.viewHeight
        this.plane.floorClip[this.rwX] = -1
      } else {
        // two sided line
        if (this.topTexture) {
          // top wall
          mid = this.pixHigh >> HEIGHT_BITS
          this.pixHigh += this.pixHighStep

          if (mid >= this.plane.floorClip[this.rwX]) {
            mid = this.plane.floorClip[this.rwX] - 1
          }

          if (mid >= yl) {
            this.draw.dcYl = yl
            this.draw.dcYh = mid
            this.draw.dcTextureMid = this.rwTopTextureMid
            this.draw.dcSource =
              this.data.textures.getColumn(this.topTexture, textureColumn).posts[0]
            this.rendering.colFunc.apply(this.draw)
            this.plane.ceilingClip[this.rwX] = mid
          } else {
            this.plane.ceilingClip[this.rwX] = yl - 1
          }
        } else {
          // no top wall
          if (this.markCeiling) {
            this.plane.ceilingClip[this.rwX] = yl - 1
          }
        }

        if (this.bottomTexture) {
          // bottom wall
          mid = this.pixLow + HEIGHT_UNIT - 1 >> HEIGHT_BITS
          this.pixLow += this.pixLowStep

          // no space above wall?
          if (mid <= this.plane.ceilingClip[this.rwX]) {
            mid = this.plane.ceilingClip[this.rwX] + 1
          }

          if (mid <= yh) {
            this.draw.dcYl = mid
            this.draw.dcYh = yh
            this.draw.dcTextureMid = this.rwBottomTextureMid
            this.draw.dcSource =
              this.data.textures.getColumn(this.bottomTexture, textureColumn).posts[0]
            this.rendering.colFunc.apply(this.draw)
            this.plane.floorClip[this.rwX] = mid
          } else {
            this.plane.floorClip[this.rwX] = yh + 1
          }
        } else {
          // no bottom wall
          if (this.markFloor) {
            this.plane.floorClip[this.rwX] = yh + 1
          }
        }

        if (this.maskedTexture) {
          if (this.maskedTextureCol === null) {
            throw 'this.maskedTextureCol = null'
          }

          // save texturecol
          //  for backdrawing of masked mid texture
          this.maskedTextureCol[this.rwX] = textureColumn
        }

      }

      this.rwScale += this.rwScaleStep
      this.topFrac += this.topStep
      this.bottomFrac += this.bottomStep
    }
  }


  //
  // R_StoreWallRange
  // A wall segment will be drawn
  //  between start and stop pixels (inclusive).
  //
  storeWallRange(start: number, stop: number): void {
    // don't overflow and crash
    if (this.bsp.dsP === MAX_DRAW_SEGS) {
      return
    }
    const dsP = this.bsp.drawSegs[this.bsp.dsP]

    if (RANGE_CHECK) {
      if (start >= this.draw.viewWidth || start > stop) {
        throw `Bad R_RenderWallRange: ${start} to ${stop}`
      }
    }

    if (this.bsp.curLine === null) {
      throw 'this.bsp.curLine = null'
    }

    this.bsp.sideDef = this.bsp.curLine.sideDef
    this.bsp.lineDef = this.bsp.curLine.lineDef

    // mark the segment as visible for auto map
    this.bsp.lineDef.flags |= MapLineFlag.Mapped

    // calculate rw_distance for scale calculation
    this.rwNormalAngle = this.bsp.curLine.angle + ANG90 >>> 0
    let offsetAngle = Math.abs(this.rwNormalAngle - this.rwAngle1 >> 0)

    if (offsetAngle > ANG90) {
      offsetAngle = ANG90
    }

    const distAngle = ANG90 - offsetAngle
    const hyp = this.rendering.pointToDist(this.bsp.curLine.v1.x, this.bsp.curLine.v1.y)
    const sineVal = fineSine[distAngle >> ANGLE_TO_FINE_SHIFT]
    this.rwDistance = mul(hyp, sineVal)

    dsP.x1 = this.rwX = start
    dsP.x2 = stop
    dsP.curLine = this.bsp.curLine
    this.rwStopX = stop + 1

    // calculate scale at both ends and step
    dsP.scale1 = this.rwScale =
      this.rendering.scaleFromGlobalAngle(
        this.rendering.viewAngle + this.rendering.xToViewAngle[start] >>> 0,
      )

    if (stop > start) {
      dsP.scale2 = this.rendering.scaleFromGlobalAngle(
        this.rendering.viewAngle + this.rendering.xToViewAngle[stop],
      )
      dsP.scaleStep = this.rwScaleStep =
        (dsP.scale2 - this.rwScale) / (stop - start) >> 0
    } else {
      dsP.scale2 = dsP.scale1
    }

    // calculate texture boundaries
    //  and decide if floor / ceiling marks are needed
    if (this.bsp.frontSector === null) {
      throw 'this.bsp.frontSector = null'
    }
    this.worldTop = this.bsp.frontSector.ceilingHeight - this.rendering.viewZ
    this.worldBottom = this.bsp.frontSector.floorHeight - this.rendering.viewZ

    this.midTexture = this.topTexture =
        this.bottomTexture = this.maskedTexture = 0

    dsP.maskedTextureCol = null

    let vTop: number
    if (!this.bsp.backSector) {
      // single sided line
      this.midTexture = this.data.textures.getNum(this.bsp.sideDef.midTexture)
      // a single sided line is terminal, so it must mark ends
      this.markFloor = this.markCeiling = true
      if (this.bsp.lineDef.flags & MapLineFlag.DontPegBottom) {
        vTop = this.bsp.frontSector.floorHeight +
          this.data.textures.getHeight(this.bsp.sideDef.midTexture)
        // bottom of texture at bottom
        this.rwMidTextureMid = vTop - this.rendering.viewZ
      } else {
        // top of texture at top
        this.rwMidTextureMid = this.worldTop
      }
      this.rwMidTextureMid += this.bsp.sideDef.rowOffset

      dsP.silhouette = SIL_BOTH
      dsP.sprTopClip = this.things.screenHeightArray
      dsP.sprBottomClip = this.things.negoneArray
      dsP.bSilHeight = 2147483647
      dsP.tSilHeight = -2147483648
    } else {
      // two sided line
      dsP.sprTopClip = dsP.sprBottomClip = null
      dsP.silhouette = 0

      if (this.bsp.frontSector.floorHeight > this.bsp.backSector.floorHeight) {
        dsP.silhouette = SIL_BOTTOM
        dsP.bSilHeight = this.bsp.frontSector.floorHeight
      } else if (this.bsp.backSector.floorHeight > this.rendering.viewZ) {
        dsP.silhouette = SIL_BOTTOM
        dsP.bSilHeight = 2147483647
        // dsP.sprbottomclip = negonearray;
      }

      if (this.bsp.frontSector.ceilingHeight < this.bsp.backSector.ceilingHeight) {
        dsP.silhouette |= SIL_TOP
        dsP.tSilHeight = this.bsp.frontSector.ceilingHeight
      } else if (this.bsp.backSector.ceilingHeight < this.rendering.viewZ) {
        dsP.silhouette |= SIL_TOP
        dsP.tSilHeight = -2147483648
        // dsP.sprtopclip = screenheightarray;
      }

      if (this.bsp.backSector.ceilingHeight <= this.bsp.frontSector.floorHeight) {
        dsP.sprBottomClip = this.things.negoneArray
        dsP.bSilHeight = 2147483647
        dsP.silhouette |= SIL_BOTTOM
      }

      if (this.bsp.backSector.floorHeight >= this.bsp.frontSector.ceilingHeight) {
        dsP.sprTopClip = this.things.screenHeightArray
        dsP.tSilHeight = -2147483648
        dsP.silhouette |= SIL_TOP
      }

      this.worldHigh = this.bsp.backSector.ceilingHeight - this.rendering.viewZ
      this.worldLow = this.bsp.backSector.floorHeight - this.rendering.viewZ

      // hack to allow height changes in outdoor areas
      if (this.bsp.frontSector.ceilingPic === this.level.sky.flatNum &&
        this.bsp.backSector.ceilingPic === this.level.sky.flatNum
      ) {
        this.worldTop = this.worldHigh
      }

      if (this.worldLow !== this.worldBottom ||
          this.bsp.backSector.floorPic !== this.bsp.frontSector.floorPic ||
          this.bsp.backSector.lightLevel !== this.bsp.frontSector.lightLevel
      ) {
        this.markFloor = true
      } else {
        // same plane on both sides
        this.markFloor = false
      }

      if (this.worldHigh !== this.worldTop ||
          this.bsp.backSector.ceilingPic !== this.bsp.frontSector.ceilingPic ||
          this.bsp.backSector.lightLevel !== this.bsp.frontSector.lightLevel
      ) {
        this.markCeiling = true
      } else {
        // same plane on both sides
        this.markCeiling = false
      }

      if (this.bsp.backSector.ceilingHeight <= this.bsp.frontSector.floorHeight ||
        this.bsp.backSector.floorHeight >= this.bsp.frontSector.ceilingHeight
      ) {
        // closed door
        this.markCeiling = this.markFloor = true
      }

      if (this.worldHigh < this.worldTop) {
        // top texture
        this.topTexture =
            this.data.textures.getNum(this.bsp.sideDef.topTexture)
        if (this.bsp.lineDef.flags & MapLineFlag.DontPegTop) {
          // top of texture at top
          this.rwTopTextureMid = this.worldTop
        } else {
          vTop = this.bsp.backSector.ceilingHeight +
            this.data.textures.getHeight(this.bsp.sideDef.topTexture)

          // bottom of texture
          this.rwTopTextureMid = vTop - this.rendering.viewZ
        }
      }
      if (this.worldLow > this.worldBottom) {
        // bottom texture
        this.bottomTexture =
            this.data.textures.getNum(this.bsp.sideDef.bottomTexture)

        if (this.bsp.lineDef.flags & MapLineFlag.DontPegBottom) {
          // bottom of texture at bottom
          // top of texture at top
          this.rwBottomTextureMid = this.worldTop
        } else {
          // top of texture at top
          this.rwBottomTextureMid = this.worldLow
        }
      }
      this.rwTopTextureMid += this.bsp.sideDef.rowOffset
      this.rwBottomTextureMid += this.bsp.sideDef.rowOffset

      // allocate space for masked texture tables
      if (this.bsp.sideDef.midTexture) {
        // masked midtexture
        this.maskedTexture = 1
        dsP.maskedTextureCol = this.maskedTextureCol =
          this.plane.openings.subarray(SCREENWIDTH + this.plane.lastOpeningPtr - this.rwX)
        this.plane.lastOpeningPtr += this.rwStopX - this.rwX
      }
    }

    // calculate rw_offset (only needed for textured lines)
    this.segTextured = this.midTexture | this.topTexture |
        this.bottomTexture | this.maskedTexture


    if (this.segTextured) {
      let offsetAngle = this.rwNormalAngle - this.rwAngle1
      offsetAngle >>>= 0

      if (offsetAngle > ANG180) {
        offsetAngle = -offsetAngle
        offsetAngle >>>= 0
      }

      if (offsetAngle > ANG90) {
        offsetAngle = ANG90
      }

      const sineVal = fineSine[offsetAngle >> ANGLE_TO_FINE_SHIFT]
      this.rwOffset = mul(hyp, sineVal)

      if (this.rwNormalAngle - this.rwAngle1 >>> 0 < ANG180) {
        this.rwOffset = -this.rwOffset
      }

      this.rwOffset += this.bsp.sideDef.textureOffset + this.bsp.curLine.offset
      this.rwCenterAngle = ANG90 + this.rendering.viewAngle - this.rwNormalAngle

      // calculate light table
      //  use different light tables
      //  for horizontal / vertical / diagonal
      // OPTIMIZE: get rid of LIGHTSEGSHIFT globally
      if (!this.rendering.fixedColorMap) {
        let lightNum = (this.bsp.frontSector.lightLevel >> LIGHT_SEG_SHIFT) +
            this.rendering.extraLight

        if (this.bsp.curLine.v1.y === this.bsp.curLine.v2.y) {
          --lightNum
        } else if (this.bsp.curLine.v1.x === this.bsp.curLine.v2.x) {
          ++lightNum
        }

        if (lightNum < 0) {
          this.wallLights = this.rendering.scaleLight[0]
        } else if (lightNum >= LIGHT_LEVELS) {
          this.wallLights = this.rendering.scaleLight[LIGHT_LEVELS - 1]
        } else {
          this.wallLights = this.rendering.scaleLight[lightNum]
        }
      }
    }

    // if a floor / ceiling plane is on the wrong side
    //  of the view plane, it is definitely invisible
    //  and doesn't need to be marked.
    if (this.bsp.frontSector.floorHeight >= this.rendering.viewZ) {
      // above view plane
      this.markFloor = false
    }

    if (this.bsp.frontSector.ceilingHeight <= this.rendering.viewZ &&
      this.bsp.frontSector.ceilingPic !== this.level.sky.flatNum
    ) {
      // below view plane
      this.markCeiling = false
    }

    // calculate incremental stepping values for texture edges
    this.worldTop >>= 4
    this.worldBottom >>= 4

    this.topStep = -mul(this.rwScaleStep, this.worldTop)
    this.topFrac = (this.rendering.centerYFrac >> 4) - mul(this.worldTop, this.rwScale)

    this.bottomStep = -mul(this.rwScaleStep,this.worldBottom)
    this.bottomFrac = (this.rendering.centerYFrac >> 4) - mul(this.worldBottom, this.rwScale)

    if (this.bsp.backSector) {
      this.worldHigh >>= 4
      this.worldLow >>= 4

      if (this.worldHigh < this.worldTop) {
        this.pixHigh = (this.rendering.centerYFrac >> 4) -
            mul(this.worldHigh, this.rwScale)
        this.pixHighStep = -mul(this.rwScaleStep, this.worldHigh)
      }

      if (this.worldLow > this.worldBottom) {
        this.pixLow = (this.rendering.centerYFrac >> 4) -
            mul(this.worldLow, this.rwScale)
        this.pixLowStep = -mul(this.rwScaleStep,this.worldLow)
      }
    }

    // render it
    if (this.markCeiling) {
      if (this.plane.ceilingPlane === null) {
        throw 'this.plane.ceilingPlane = null'
      }
      this.plane.ceilingPlane = this.plane.checkPlane(
        this.plane.ceilingPlane,
        this.rwX,
        this.rwStopX - 1,
      )
    }

    if (this.markFloor) {
      if (this.plane.floorPlane === null) {
        throw 'this.plane.floorPlane = null'
      }
      this.plane.floorPlane = this.plane.checkPlane(
        this.plane.floorPlane,
        this.rwX,
        this.rwStopX - 1,
      )
    }

    this.renderSegLoop()

    // save sprite clipping info
    if ((dsP.silhouette & SIL_TOP || this.maskedTexture) &&
        !dsP.sprTopClip
    ) {
      this.plane.openings.set(
        this.plane.ceilingClip.subarray(start, start + 2 * (this.rwStopX - start)),
        SCREENWIDTH + this.plane.lastOpeningPtr,
      )

      dsP.sprTopClip = this.plane.openings.subarray(SCREENWIDTH + this.plane.lastOpeningPtr - start)
      this.plane.lastOpeningPtr += this.rwStopX - start
    }

    if ((dsP.silhouette & SIL_BOTTOM || this.maskedTexture) &&
        !dsP.sprBottomClip
    ) {
      this.plane.openings.set(
        this.plane.floorClip.subarray(start, start + 2 * (this.rwStopX - start)),
        SCREENWIDTH + this.plane.lastOpeningPtr,
      )

      dsP.sprBottomClip = this.plane.openings.subarray(SCREENWIDTH + this.plane.lastOpeningPtr - start)
      this.plane.lastOpeningPtr += this.rwStopX - start
    }

    if (this.maskedTexture && !(dsP.silhouette & SIL_TOP)) {
      dsP.silhouette |= SIL_TOP
      dsP.tSilHeight = -2147483648
    }
    if (this.maskedTexture && !(dsP.silhouette & SIL_BOTTOM)) {
      dsP.silhouette |= SIL_BOTTOM
      dsP.bSilHeight = 2147483647
    }

    ++this.bsp.dsP
  }
}
