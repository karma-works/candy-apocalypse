import { DrawSeg, SIL_BOTTOM, SIL_TOP } from './defs/draw-seg'
import { FF_FRAMEMASK, FF_FULLBRIGHT, PSpriteDef, PSpriteNum } from '../play/sprite'
import { FRACBITS, FRACUNIT, div, mul } from '../misc/fixed'
import { LIGHT_LEVELS, LIGHT_SCALE_SHIFT, LIGHT_SEG_SHIFT, MAX_LIGHT_SCALE, Rendering } from './rendering'
import { PowerType, RANGE_CHECK, SCREENWIDTH } from '../global/doomdef'
import { ANG45 } from '../misc/table'
import { Column } from './defs/column'
import { Data } from './data'
import { Draw } from './draw'
import { MObj } from '../play/mobj/mobj'
import { MObjFlag } from '../play/mobj/mobj-flag'
import { Play } from '../play/setup'
import { Post } from './defs/post'
import { Sector } from './defs/sector'
import { Segs } from './segs'
import { SpriteArray } from '../sprites/sprite-array'
import { SpriteDefsArray } from '../sprites/sprite-defs-array'
import { VisSprite } from './things/vis-sprite'

export const MINZ = FRACUNIT*4
const BASE_Y_CENTER = 100

export const MAX_VIS_SPRITES = 128

export class Things {
  private get data(): Data {
    return this.rendering.data
  }
  private get draw(): Draw {
    return this.rendering.draw
  }
  private get play(): Play {
    return this.rendering.doom.play
  }
  private get segs(): Segs {
    return this.rendering.segs
  }
  private get sprites(): SpriteArray {
    return this.data.sprites
  }
  private get spriteDefs(): SpriteDefsArray {
    return this.data.spriteDefs
  }
  constructor(protected rendering: Rendering) { }

  //
  // Sprite rotation 0 is facing the viewer,
  //  rotation 1 is one angle turn CLOCKWISE around the axis.
  // This is not the same as the angle,
  //  which increases counter clockwise (protractor).
  // There was a lot of stuff grabbed wrong, so I changed it...
  //
  pSpriteScale = 0
  pSpriteIScale = 0

  private spriteLights = new Array<Uint8ClampedArray>()

  // constant arrays
  //  used for psprite clipping and initializing clipping
  negoneArray = new Int16Array(SCREENWIDTH)
  screenHeightArray = new Int16Array(SCREENWIDTH)

  //
  // INITIALIZATION FUNCTIONS
  //


  //
  // GAME FUNCTIONS
  //
  private visSprites = Array.from({ length: MAX_VIS_SPRITES }, () => new VisSprite())
  private visSpritePtr = -1


  //
  // R_InitSprites
  // Called at program start.
  //
  initSprites(): void {
    for (let i = 0; i < SCREENWIDTH; ++i) {
      this.negoneArray[i] = -1
    }
  }

  //
  // R_ClearSprites
  // Called at frame start.
  //
  clearSprites(): void {
    this.visSpritePtr = 0
  }


  //
  // R_NewVisSprite
  //
  private overflowSprite = new VisSprite()

  newVisSprite(): VisSprite {
    if (this.visSpritePtr === MAX_VIS_SPRITES) {
      return this.overflowSprite
    }
    this.visSpritePtr++

    return this.visSprites[this.visSpritePtr - 1]
  }

  //
  // R_DrawMaskedColumn
  // Used for sprites and masked mid textures.
  // Masked means: partly transparent, i.e. stored
  //  in posts/runs of opaque pixels.
  //
  mFloorClip: null | Int16Array = null
  mCeilingClip: null | Int16Array = null

  sprYScale = 0
  sprTopScreen = 0

  drawMaskedColumn(column: Column): void {
    if (this.rendering.colFunc === null) {
      throw 'this.colFunc = null'
    }
    if (this.mFloorClip === null) {
      throw 'this.mFloorClip = null'
    }
    if (this.mCeilingClip === null) {
      throw 'this.mCeilingClip = null'
    }

    const baseTextureMid = this.draw.dcTextureMid

    let topScreen: number
    let bottomScreen: number
    let post: Post
    for (post of column.posts) {
      // calculate unclipped screen coordinates
      //  for post
      topScreen = this.sprTopScreen + this.sprYScale * post.topDelta
      bottomScreen = topScreen + this.sprYScale * post.length

      this.draw.dcYl = topScreen + FRACUNIT - 1 >> FRACBITS
      this.draw.dcYh = bottomScreen - 1 >> FRACBITS


      if (this.draw.dcYh >= this.mFloorClip[this.draw.dcX]) {
        this.draw.dcYh = this.mFloorClip[this.draw.dcX] - 1
      }
      if (this.draw.dcYl <= this.mCeilingClip[this.draw.dcX]) {
        this.draw.dcYl = this.mCeilingClip[this.draw.dcX] + 1
      }

      if (this.draw.dcYl <= this.draw.dcYh) {
        this.draw.dcSource = post
        this.draw.dcTextureMid = baseTextureMid - (post.topDelta << FRACBITS)

        // Drawn by either R_DrawColumn
        //  or (SHADOW) R_DrawFuzzColumn.
        this.rendering.colFunc.apply(this.draw)
      }
    }

    this.draw.dcTextureMid = baseTextureMid
  }

  //
  // R_DrawVisSprite
  //  mfloorclip and mceilingclip should also be set.
  //
  drawVisSprite(vis: VisSprite): void {
    const patch = this.sprites[vis.patch].patch

    this.draw.dcColorMap = vis.colorMap

    if (this.draw.dcColorMap === null) {
      // NULL colormap = shadow draw
      this.rendering.colFunc = this.rendering.fuzzColFunc
    } else if (vis.mobjFlags & MObjFlag.Translation) {
      this.rendering.colFunc = this.draw.drawTranslatedColumn
      this.draw.dcTranslation = this.draw.translationTables.slice(
        0 - 256 +
        ((vis.mobjFlags & MObjFlag.Translation) >> MObjFlag.TransShift - 8),
      )
    }

    this.draw.dcIScale = Math.abs(vis.xIScale) >> this.rendering.detailShift
    this.draw.dcTextureMid = vis.textureMid
    let frac = vis.startFrac
    this.sprYScale = vis.scale
    this.sprTopScreen = this.rendering.centerYFrac -
        mul(this.draw.dcTextureMid, this.sprYScale)

    let textureColumn: number
    let column: Column
    for (this.draw.dcX = vis.x1; this.draw.dcX <= vis.x2; this.draw.dcX++, frac += vis.xIScale) {
      textureColumn = frac >> FRACBITS

      if (RANGE_CHECK) {
        if (textureColumn < 0 || textureColumn >= patch.width) {
          throw 'R_DrawSpriteRange: bad texturecolumn'
        }
      }

      column = patch.columns[textureColumn]
      this.drawMaskedColumn(column)
    }

    this.rendering.colFunc = this.rendering.baseColFunc
  }

  //
  // R_ProjectSprite
  // Generates a vissprite for a thing
  //  if it might be visible.
  //
  projectSprite(thing: MObj): void {
    // transform the origin point
    const trX = thing.x - this.rendering.viewX
    const trY = thing.y - this.rendering.viewY

    let gXt = mul(trX, this.rendering.viewCos)
    let gYt = -mul(trY, this.rendering.viewSin)

    const tz = gXt - gYt

    // thing is behind view plane?
    if (tz < MINZ) {
      return
    }

    const xScale = div(this.rendering.projection, tz)

    gXt = -mul(trX, this.rendering.viewSin)
    gYt = mul(trY, this.rendering.viewCos)
    let tx = -(gYt + gXt)

    // too far off the side?
    if (Math.abs(tx) > tz << 2) {
      return
    }

    // decide which patch to use for sprite relative to player
    if (RANGE_CHECK) {
      if (thing.sprite >= this.spriteDefs.length) {
        throw `R_ProjectSprite: invalid sprite number ${thing.sprite}`
      }
    }

    const sprDef = this.spriteDefs[thing.sprite]

    if (RANGE_CHECK) {
      if ((thing.frame & FF_FRAMEMASK) >= sprDef.frames.length) {
        throw `R_ProjectSprite: invalid sprite frame ${thing.sprite} : ${thing.frame} `
      }
    }

    const sprFrame = sprDef.frames[thing.frame & FF_FRAMEMASK]

    let lump: number
    let flip: boolean
    if (sprFrame.rotate) {
      // choose a different rotation based on player view
      const ang = this.rendering.pointToAngle(thing.x, thing.y)
      const rot = ang - thing.angle + ANG45 / 2 * 9 >>> 29
      lump = sprFrame.lump[rot]
      flip = !!sprFrame.flip[rot]
    } else {
      // use single rotation for all views
      lump = sprFrame.lump[0]
      flip = !!sprFrame.flip[0]
    }

    // calculate edges of the shape
    tx -= this.sprites[lump].leftOffset
    const x1 = this.rendering.centerXFrac + mul(tx, xScale) >> FRACBITS

    // off the right side?
    if (x1 > this.draw.viewWidth) {
      return
    }

    tx += this.sprites[lump].width
    const x2 = (this.rendering.centerXFrac + mul(tx, xScale) >> FRACBITS) - 1

    // off the left side
    if (x2 < 0) {
      return
    }

    // store information in a vissprite
    const vis = this.newVisSprite()
    vis.mobjFlags = thing.flags
    vis.scale = xScale << this.rendering.detailShift
    vis.gX = thing.x
    vis.gY = thing.y
    vis.gZ = thing.z
    vis.gZt = thing.z + this.sprites[lump].topOffset
    vis.textureMid = vis.gZt - this.rendering.viewZ
    vis.x1 = x1 < 0 ? 0 : x1
    vis.x2 = x2 >= this.draw.viewWidth ? this.draw.viewWidth - 1 : x2
    const iScale = div(FRACUNIT, xScale)

    if (flip) {
      vis.startFrac = this.sprites[lump].width - 1
      vis.xIScale = -iScale
    } else {
      vis.startFrac = 0
      vis.xIScale = iScale
    }

    if (vis.x1 > x1) {
      vis.startFrac += vis.xIScale * (vis.x1 - x1)
    }
    vis.patch = lump
    // get light level
    if (thing.flags & MObjFlag.Shadow) {
      // shadow draw
      vis.colorMap = null
    } else if (this.rendering.fixedColorMap) {
      // fixed map
      vis.colorMap = this.rendering.fixedColorMap
    } else if (thing.frame & FF_FULLBRIGHT) {
      // full bright
      vis.colorMap = this.data.colorMaps
    } else {
      // diminished light
      let index = xScale >> LIGHT_SCALE_SHIFT - this.rendering.detailShift

      if (index >= MAX_LIGHT_SCALE) {
        index = MAX_LIGHT_SCALE - 1
      }

      vis.colorMap = this.spriteLights[index]
    }
  }

  //
  // R_AddSprites
  // During BSP traversal, this adds sprites by sector.
  //
  addSprites(sec: Sector): void {
    // BSP is traversed by subsector.
    // A sector might have been split into several
    //  subsectors during BSP building.
    // Thus we check whether its already added.
    if (sec.validCount === this.play.validCount) {
      return
    }

    // Well, now it will be done.
    sec.validCount = this.play.validCount

    const lightNum = (sec.lightLevel >> LIGHT_SEG_SHIFT) + this.rendering.extraLight

    if (lightNum < 0) {
      this.spriteLights = this.rendering.scaleLight[0]
    } else if (lightNum >= LIGHT_LEVELS) {
      this.spriteLights = this.rendering.scaleLight[LIGHT_LEVELS - 1]
    } else {
      this.spriteLights = this.rendering.scaleLight[lightNum]
    }

    // Handle all things in sector.
    for (let thing = sec.thingList; thing; thing = thing.sNext) {
      this.projectSprite(thing)
    }
  }

  //
  // R_DrawPSprite
  //
  drawPSprite(psp: PSpriteDef): void {
    if (psp.state === null) {
      throw 'psp.state = null'
    }

    // decide which patch to use
    if (RANGE_CHECK) {
      if (psp.state.sprite >= this.spriteDefs.length) {
        throw `R_ProjectSprite: invalid sprite number ${psp.state.sprite} `
      }
    }
    const sprDef = this.spriteDefs[psp.state.sprite]
    if (RANGE_CHECK) {
      if ((psp.state.frame & FF_FRAMEMASK) >= sprDef.frames.length) {
        throw `R_ProjectSprite: invalid sprite frame ${psp.state.sprite} : ${psp.state.frame} `
      }
    }
    const sprFrame = sprDef.frames[psp.state.frame & FF_FRAMEMASK]

    const lump = sprFrame.lump[0]
    const flip = !!sprFrame.flip[0]


    // calculate edges of the shape
    let tx = psp.sX - 160 * FRACUNIT

    tx -= this.sprites[lump].leftOffset
    const x1 = this.rendering.centerXFrac + mul(tx, this.pSpriteScale) >> FRACBITS

    // off the right side?
    if (x1 > this.draw.viewWidth) {
      return
    }

    tx += this.sprites[lump].width
    const x2 = (this.rendering.centerXFrac + mul(tx, this.pSpriteScale) >> FRACBITS) - 1

    // off the left side
    if (x2 < 0) {
      return
    }

    // store information in a vissprite
    const vis = new VisSprite()
    vis.mobjFlags = 0
    vis.textureMid = (BASE_Y_CENTER << FRACBITS) + FRACUNIT / 2 -
        (psp.sY - this.sprites[lump].topOffset)
    vis.x1 = x1 < 0 ? 0 : x1
    vis.x2 = x2 >= this.draw.viewWidth ? this.draw.viewWidth - 1 : x2
    vis.scale = this.pSpriteScale << this.rendering.detailShift

    if (flip) {
      vis.xIScale = -this.pSpriteIScale
      vis.startFrac = this.sprites[lump].width - 1
    } else {
      vis.xIScale = this.pSpriteIScale
      vis.startFrac = 0
    }

    if (vis.x1 > x1) {
      vis.startFrac += vis.xIScale * (vis.x1 - x1)
    }
    vis.patch = lump

    if (this.rendering.viewPlayer === null) {
      throw 'this.rendering.viewPlayer = null'
    }

    if (this.rendering.viewPlayer.powers[PowerType.Invisibility] > 4 * 32 ||
      this.rendering.viewPlayer.powers[PowerType.Invisibility] & 8) {
      // shadow draw
      vis.colorMap = null
    } else if (this.rendering.fixedColorMap) {
      // fixed map
      vis.colorMap = this.rendering.fixedColorMap
    } else if (psp.state.frame & FF_FULLBRIGHT) {
      // full bright
      vis.colorMap = this.data.colorMaps
    } else {
      // local light
      vis.colorMap = this.spriteLights[MAX_LIGHT_SCALE - 1]
    }

    this.drawVisSprite(vis)
  }

  //
  // R_DrawPlayerSprites
  //
  drawPlayerSprites(): void {
    if (this.rendering.viewPlayer === null) {
      throw 'this.rendering.viewPlayer = null'
    }
    if (this.rendering.viewPlayer.mo === null) {
      throw 'this.rendering.viewPlayer.mo = null'
    }
    if (this.rendering.viewPlayer.mo.subSector === null) {
      throw 'this.rendering.viewPlayer.mo.subSector = null'
    }
    if (this.rendering.viewPlayer.mo.subSector.sector === null) {
      throw 'this.rendering.viewPlayer.mo.subSector.sector = null'
    }

    // get light level
    const lightNum =
      (this.rendering.viewPlayer.mo.subSector.sector.lightLevel >> LIGHT_SEG_SHIFT) +
      this.rendering.extraLight

    if (lightNum < 0) {
      this.spriteLights = this.rendering.scaleLight[0]
    } else if (lightNum >= LIGHT_LEVELS) {
      this.spriteLights = this.rendering.scaleLight[LIGHT_LEVELS - 1]
    } else {
      this.spriteLights = this.rendering.scaleLight[lightNum]
    }

    // clip to screen bounds
    this.mFloorClip = this.screenHeightArray
    this.mCeilingClip = this.negoneArray

    // add all active psprites
    let psp: PSpriteDef
    for (let i = 0; i < PSpriteNum.NUM_PSPRITES; ++i) {
      psp = this.rendering.viewPlayer.pSprites[i]
      if (psp.state) {
        this.drawPSprite(psp)
      }
    }
  }

  //
  // R_SortVisSprites
  //
  private vSprSortedHead = new VisSprite()

  sortVisSprites(): void {
    const count = this.visSpritePtr

    const unsorted = new VisSprite()
    unsorted.next = unsorted.prev = unsorted

    if (!count) {
      return
    }

    let ds: VisSprite | null
    for (let dsP = 0; dsP < this.visSpritePtr; ++dsP) {
      ds = this.visSprites[dsP]
      ds.next = this.visSprites[dsP + 1]
      ds.prev = this.visSprites[dsP - 1]
    }

    this.visSprites[0].prev = unsorted
    unsorted.next = this.visSprites[0]
    this.visSprites[this.visSpritePtr - 1].next = unsorted
    unsorted.prev = this.visSprites[this.visSpritePtr - 1]

    // pull the vissprites out by scale
    //best = 0; // shut up the compiler warning
    this.vSprSortedHead.next = this.vSprSortedHead.prev = this.vSprSortedHead

    let bestScale: number
    let best: VisSprite | null = null
    for (let i = 0; i < count; ++i) {
      bestScale = 2147483647
      for (ds = unsorted.next; ds && ds !== unsorted; ds = ds.next) {
        if (ds.scale < bestScale) {
          bestScale = ds.scale
          best = ds
        }
      }
      if (best === null) {
        throw 'best = null'
      }
      if (best.next === null) {
        throw 'best.next = null'
      }
      if (best.prev === null) {
        throw 'best.prev = null'
      }

      best.next.prev = best.prev
      best.prev.next = best.next
      best.next = this.vSprSortedHead
      best.prev = this.vSprSortedHead.prev
      this.vSprSortedHead.prev.next = best
      this.vSprSortedHead.prev = best
    }
  }

  //
  // R_DrawSprite
  //
  drawSprite(spr: VisSprite): void {

    const clipBot = new Int16Array(SCREENWIDTH)
    const clipTop = new Int16Array(SCREENWIDTH)

    let x: number
    for (x = spr.x1; x <= spr.x2; ++x) {
      clipBot[x] = clipTop[x] = -2
    }

    // Scan drawsegs from end to start for obscuring segs.
    // The first drawseg that has a greater scale
    //  is the clip seg.
    let ds: DrawSeg
    let r1: number
    let r2: number
    let lowScale: number
    let scale: number
    let silhouette: number
    for (let dsPtr = this.segs.dsP - 1; dsPtr >= 0; --dsPtr) {
      ds = this.segs.drawSegs[dsPtr]
      // determine if the drawseg obscures the sprite
      if (ds.x1 > spr.x2 ||
        ds.x2 < spr.x1 ||
        !ds.silhouette && !ds.maskedTextureCol
      ) {
        // does not cover sprite
        continue
      }

      r1 = ds.x1 < spr.x1 ? spr.x1 : ds.x1
      r2 = ds.x2 > spr.x2 ? spr.x2 : ds.x2

      if (ds.scale1 > ds.scale2) {
        lowScale = ds.scale2
        scale = ds.scale1
      } else {
        lowScale = ds.scale1
        scale = ds.scale2
      }

      if (ds.curLine === null) {
        throw 'ds.curLine = null'
      }

      if (scale < spr.scale ||
        lowScale < spr.scale &&
          !ds.curLine.pointOnSegSide(spr.gX, spr.gY)
      ) {
        // masked mid texture?
        if (ds.maskedTextureCol) {
          this.segs.renderMaskedSegRange(ds, r1, r2)
        }
        // seg is behind sprite
        continue
      }

      // clip this piece of the sprite
      silhouette = ds.silhouette

      if (spr.gZ >= ds.bSilHeight) {
        silhouette &= ~SIL_BOTTOM
      }

      if (spr.gZt <= ds.tSilHeight) {
        silhouette &= ~SIL_TOP
      }

      if (silhouette === 1) {
        // bottom sil
        for (x = r1; x <= r2; ++x) {
          if (clipBot[x] === -2) {
            if (ds.sprBottomClip === null) {
              throw 'ds.sprBottomClip = null'
            }
            clipBot[x] = ds.sprBottomClip[x]
          }
        }
      } else if (silhouette === 2) {
        // top sil
        for (x = r1; x <= r2; ++x) {
          if (clipTop[x] === -2) {
            if (ds.sprTopClip === null) {
              throw 'ds.sprTopClip = null'
            }
            clipTop[x] = ds.sprTopClip[x]
          }
        }
      } else if (silhouette === 3) {
        // both
        for (x = r1; x <= r2; ++x) {
          if (clipBot[x] === -2) {
            if (ds.sprBottomClip === null) {
              throw 'ds.sprBottomClip = null'
            }
            clipBot[x] = ds.sprBottomClip[x]
          }
          if (clipTop[x] === -2) {
            if (ds.sprTopClip === null) {
              throw 'ds.sprTopClip = null'
            }
            clipTop[x] = ds.sprTopClip[x]
          }
        }
      }

    }

    // all clipping has been performed, so draw the sprite

    // check for unclipped columns
    for (x = spr.x1; x <= spr.x2; ++x) {
      if (clipBot[x] === -2) {
        clipBot[x] = this.draw.viewHeight
      }

      if (clipTop[x] === -2) {
        clipTop[x] = -1
      }
    }

    this.mFloorClip = clipBot
    this.mCeilingClip = clipTop

    this.drawVisSprite(spr)
  }

  //
  // R_DrawMasked
  //
  drawMasked(): void {
    this.sortVisSprites()

    if (this.visSpritePtr > 0) {
      // draw all vissprites back to front
      for (let spr = this.vSprSortedHead.next;
        spr && spr !== this.vSprSortedHead;
        spr = spr.next
      ) {
        this.drawSprite(spr)
      }
    }

    // render any remaining masked mid textures
    let ds: DrawSeg
    for (let dsPtr = this.segs.dsP - 1; dsPtr >= 0; --dsPtr) {
      ds = this.segs.drawSegs[dsPtr]
      if (ds.maskedTextureCol) {
        this.segs.renderMaskedSegRange(ds, ds.x1, ds.x2)
      }
    }

    // draw the psprites on top of everything
    //  but does not draw on side views
    if (!this.rendering.viewAngleOffset) {
      this.drawPlayerSprites()
    }
  }
}
