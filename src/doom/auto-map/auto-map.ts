import { ANGLE_TO_FINE_SHIFT, FINE_ANGLES, fineSine } from '../misc/table'
import { DEvent, EvType } from '../doom/event'
import { FRACBITS, FRACUNIT, div, mul } from '../misc/fixed'
import { Line, Point, cheatPlayerArrow, playerArrow, thinTriangleGuy } from './models'
import { MAP_BLOCK_UNITS, PLAYER_RADIUS } from '../play/local'
import { MAX_PLAYERS, PowerType, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { Doom } from '../doom'
import { Game } from '../game/game'
import { Level } from '../level/level'
import { LumpReader } from '../wad/lump-reader'
import { MObj } from '../play/mobj/mobj'
import { MapLineFlag } from '../doom/data'
import { Patch } from '../rendering/defs/patch'
import { Player } from '../doom/player'
import { ScanCode } from '../interfaces/scancodes'
import { StatusBar } from '../status/stuff'
import { Strings } from '../translation/strings'
import { Video } from '../rendering/video'

export const AM_MSGHEADER = ('a'.charCodeAt(0) << 24) + ('m'.charCodeAt(0) << 16)
export const AM_MSGENTERED = AM_MSGHEADER | 'e'.charCodeAt(0) << 8
export const AM_MSGEXITED = AM_MSGHEADER | 'x'.charCodeAt(0) << 8

// For use if I do walls with outsides/insides
const REDS = 256 - 5 * 16
const RED_RANGE = 16
const GREENS = 7 * 16
const GRAYS = 6 * 16
const GRAYS_RANGE = 16
const BROWNS = 4 * 16
const YELLOWS = 256 - 32 + 7
const BLACK = 0
const WHITE = 256 - 47

// Automap colors
const BACKGROUND = BLACK
const WALL_COLORS = REDS
const WALL_RANGE = RED_RANGE
const TS_WALL_COLORS = GRAYS
const FD_WALL_COLORS = BROWNS
const CD_WALL_COLORS = YELLOWS
const THING_COLORS = GREENS
const SECRET_WALL_COLORS = WALL_COLORS
const GRID_COLORS = GRAYS + GRAYS_RANGE / 2
const XHAIR_COLORS = GRAYS

// drawing stuff
const FB = 0

const PAN_DOWN_KEY = ScanCode.ArrowDown
const PAN_UP_KEY = ScanCode.ArrowUp
const PAN_RIGHT_KEY = ScanCode.ArrowRight
const PAN_LEFT_KEY = ScanCode.ArrowLeft
const ZOOM_IN_KEY = ScanCode.Equal
const ZOOM_OUT_KEY = ScanCode.Minus
const START_KEY = ScanCode.Tab
const END_KEY = ScanCode.Tab
const GO_BIG_KEY = ScanCode.Digit0
const FOLLOW_KEY = ScanCode.KeyF
const GRID_KEY = ScanCode.KeyG
const MARK_KEY = ScanCode.KeyM
const CLEAR_MARK_KEY = ScanCode.KeyC

const NUM_MARK_POINTS = 10

// scale on entry
const INIT_SCALE_M2F = .2 * FRACUNIT
// how much the automap moves window per tic in frame-buffer coordinates
// moves 140 pixels in 1 second
const PAN_INC = 4
// how much zoom-in per tic
// goes to 2x in 1 second
const ZOOM_IN = 1.02 * FRACUNIT >> 0
// how much zoom-out per tic
// pulls out to 0.5x in 1 second
const ZOOM_OUT = FRACUNIT / 1.02 >> 0

// the following is crap
const LINE_NEVERSEE = MapLineFlag.DontDraw

// translates between frame-buffer and map distances
const f2m = (x: number, scaleF2M: number) => mul(x << 16, scaleF2M)
const m2f = (x: number, scaleM2F: number) => mul(x, scaleM2F) >> 16
// translates between frame-buffer and map coordinates
const cxm2f = (x: number, scaleM2F: number, fx: number, mx: number) => fx + m2f(x - mx, scaleM2F)
const cym2f = (y: number, scaleM2F: number, fy: number, fh: number, my: number) => fy + (fh - m2f(y - my, scaleM2F))

export class AutoMap {

  private cheating = 0
  private grid = false

  active = false
  private finitWidth = SCREENWIDTH
  private finitHeight = SCREENHEIGHT - 32

  // location of window on screen
  private fx = 0
  private fy = 0

  // size of window on screen
  private fw = 0
  private fh = 0

  // used for funky strobing effect
  private lightLev = 0
  // pseudo-frame buffer
  private get fb(): Uint8ClampedArray {
    return this.rVideo.screens[0]
  }

  // how far the window pans each tic (map coords)
  private panInc = new Point()
  // how far the window zooms in each tic (map coords)
  private m2fZoomMul = 0
  // how far the window zooms in each tic (fb coords)
  private f2mZoomMul = 0

  // LL x,y where the window is on the map (map coords)
  private mx = 0
  private my = 0
  // UR x,y where the window is on the map (map coords)
  private mx2 = 0
  private my2 = 0

  //
  // width/height of window on map (map coords)
  //
  private mw = 0
  private mh = 0

  // based on level size
  private minX = 0
  private minY = 0
  private maxX = 0
  private maxY = 0

  // max_x-min_x,
  private maxW = 0
  // max_y-min_y
  private maxH = 0

  // used to tell when to stop zooming out
  private minScaleM2F = 0
  // used to tell when to stop zooming in
  private maxScaleM2F = 0

  // old stuff for recovery later
  private oldMW = 0
  private oldMH = 0
  private oldMX = 0
  private oldMY = 0

  // old location used by the Follower routine
  private oldLoc = new Point()

  // used by MTOF to scale from map-to-frame-buffer coords
  private scaleM2F = INIT_SCALE_M2F
  // used by FTOM to scale from frame-buffer-to-map coords (=1/scale_mtof)
  private scaleF2M = 0

  // the player represented by an arrow
  private player: Player | null = null

  // numbers used for marking by the automap
  private markNums = new Array<Patch>(10)
  // where the points are
  private markPoints = Array.from({ length: NUM_MARK_POINTS }, () => new Point())
  // next point to be assigned
  private markPointNum = 0

  // specifies whether to follow the player around
  private followPlayer = true

  private stopped = true

  private get game(): Game {
    return this.doom.game
  }
  private get level(): Level {
    return this.doom.play.level
  }
  private get rVideo(): Video {
    return this.doom.rendering.video
  }
  private get statusBar(): StatusBar {
    return this.doom.statusBar
  }
  private get strings(): Strings {
    return this.doom.strings
  }
  private get wad(): LumpReader {
    return this.doom.wad
  }

  constructor(private doom: Doom) { }

  private activateNewScale(): void {
    this.mx += this.mw / 2 >> 0
    this.my += this.mh / 2 >> 0
    this.mw = f2m(this.fw, this.scaleF2M)
    this.mh = f2m(this.fh, this.scaleF2M)
    this.mx -= this.mw / 2 >> 0
    this.my -= this.mh / 2 >> 0
    this.mx2 = this.mx + this.mw
    this.my2 = this.my + this.mh
  }

  private saveScaleAndLoc(): void {
    this.oldMX = this.mx
    this.oldMY = this.my
    this.oldMW = this.mw
    this.oldMH = this.mh
  }
  private restoreScaleAndLoc(): void {
    this.mw = this.oldMW
    this.mh = this.oldMH
    if (!this.followPlayer) {
      this.mx = this.oldMX
      this.my = this.oldMY
    } else {
      if (this.player === null) {
        throw 'this.player = null'
      }
      if (this.player.mo === null) {
        throw 'this.player.mo = null'
      }
      this.mx = this.player.mo.x - (this.mw / 2 >> 0)
      this.my = this.player.mo.y - (this.mh / 2 >> 0)
    }
    this.mx2 = this.mx + this.mw
    this.my2 = this.my + this.mh

    // Change the scaling multipliers
    this.scaleM2F = div(this.fw << FRACBITS, this.mw)
    this.scaleF2M = div(FRACUNIT, this.scaleM2F)
  }

  //
  // adds a marker at the current location
  //
  private addMark(): void {
    this.markPoints[this.markPointNum].x = this.mx + (this.mw / 2 >> 0)
    this.markPoints[this.markPointNum].y = this.my + (this.mh / 2 >> 0)
    this.markPointNum = (this.markPointNum + 1) % NUM_MARK_POINTS
  }

  //
  // Determines bounding box of all vertices,
  // sets global variables controlling zoom range.
  //
  private findMinMaxBoundaries(): void {
    this.minX = this.minY = 0x7fffffff
    this.maxX = this.maxY = -0x7fffffff

    const vertexes = this.level.vertexes

    for (let i = 0; i < this.level.vertexes.length; i++) {
      if (vertexes[i].x < this.minX) {
        this.minX = vertexes[i].x
      } else if (vertexes[i].x > this.maxX) {
        this.maxX = vertexes[i].x
      }

      if (vertexes[i].y < this.minY) {
        this.minY = vertexes[i].y
      } else if (vertexes[i].y > this.maxY) {
        this.maxY = vertexes[i].y
      }
    }

    this.maxW = this.maxX - this.minX
    this.maxH = this.maxY - this.minY


    const a = div(this.fw << FRACBITS, this.maxW)
    const b = div(this.fh << FRACBITS, this.maxH)

    this.minScaleM2F = a < b ? a : b
    this.maxScaleM2F = div(this.fh << FRACBITS, 2 * PLAYER_RADIUS)
  }

  private changeWindowLoc(): void {
    if (this.panInc.x || this.panInc.y) {
      this.followPlayer = false
      this.oldLoc.x = 0x7fffffff
    }

    this.mx += this.panInc.x
    this.my += this.panInc.y

    if (this.mx + (this.mw / 2 >> 0) > this.maxX) {
      this.mx = this.maxX - (this.mw / 2 >> 0)
    } else if (this.mx + (this.mw / 2 >> 0) < this.minX) {
      this.mx = this.minX - (this.mw / 2 >> 0)
    }

    if (this.my + (this.mh / 2 >> 0) > this.maxY) {
      this.my = this.maxY - (this.mh / 2 >> 0)
    } else if (this.my + (this.mh / 2 >> 0) < this.minY) {
      this.my = this.minY - (this.mh / 2 >> 0)
    }

    this.mx2 = this.mx + this.mw
    this.my2 = this.my + this.mh
  }

  private initVariables(): void {
    this.active = true
    this.oldLoc.x = 0x7fffffff
    this.lightLev = 0

    // old stuff for recovery later
    this.panInc.x = this.panInc.y = 0
    this.f2mZoomMul = FRACUNIT
    this.m2fZoomMul = FRACUNIT

    this.mw = f2m(this.fw, this.scaleF2M)
    this.mh = f2m(this.fh, this.scaleF2M)

    // find player to center on initially
    let pNum = this.game.consolePlayer
    if (!this.game.playerInGame[pNum]) {
      for (pNum = 0; pNum < MAX_PLAYERS; pNum++) {
        if (this.game.playerInGame[pNum]) {
          break
        }
      }
    }

    this.player = this.game.players[pNum]
    if (this.player.mo === null) {
      throw 'this.player.mo = null'
    }
    this.mx = this.player.mo.x - (this.mw / 2 >> 0)
    this.my = this.player.mo.y - (this.mh / 2 >> 0)
    this.changeWindowLoc()

    // for saving & restoring
    this.oldMX = this.mx
    this.oldMY = this.my
    this.oldMW = this.mw
    this.oldMH = this.mh

    // inform the status bar of the change
    // ST_Responder(&st_notify);
    this.statusBar.responder({
      type: EvType.KeyUp, data1: AM_MSGENTERED, data2: 0, data3: 0,
    })
  }

  private loadPics(): void {
    let nameBuf: string
    for (let i = 0; i < 10; ++i) {
      nameBuf = `AMMNUM${i}`
      this.markNums[i] = this.wad.cacheLumpName(nameBuf, Patch)
    }
  }

  private clearMarks(): void {
    for (let i = 0; i < NUM_MARK_POINTS; i++) {
      // means empty
      this.markPoints[i].x = -1
    }
    this.markPointNum = 0
  }

  //
  // should be called at the start of every level
  // right now, i figure it out myself
  //
  private levelInit(): void {

    this.fx = this.fy = 0
    this.fw = this.finitWidth
    this.fh = this.finitHeight

    this.clearMarks()

    this.findMinMaxBoundaries()
    this.scaleM2F = div(this.minScaleM2F, 0.7 * FRACUNIT >> 0)
    if (this.scaleM2F > this.maxScaleM2F) {
      this.scaleM2F = this.minScaleM2F
    }
    this.scaleF2M = div(FRACUNIT, this.scaleM2F)
  }

  stop(): void {
    this.active = false
    this.statusBar.responder({
      type: 0,
      data1: EvType.KeyUp,
      data2: AM_MSGEXITED,
      data3: 0,
    })
    this.stopped = true
  }

  private lastLevel = -1
  private lastEpisode = -1
  private start(): void {
    if (!this.stopped) {
      this.stop()
    }
    this.stopped = false
    if (this.lastLevel !== this.game.gameMap ||
      this.lastEpisode !== this.game.gameEpisode
    ) {
      this.levelInit()
      this.lastLevel = this.game.gameMap
      this.lastEpisode = this.game.gameEpisode
    }
    this.initVariables()
    this.loadPics()
  }

  //
  // set the window scale to the maximum size
  //
  private minOutWindowScale(): void {
    this.scaleM2F = this.minScaleM2F
    this.scaleF2M = div(FRACUNIT, this.scaleM2F)
    this.activateNewScale()
  }

  //
  // set the window scale to the minimum size
  //
  private maxOutWindowScale(): void {
    this.scaleM2F = this.maxScaleM2F
    this.scaleF2M = div(FRACUNIT, this.scaleM2F)
    this.activateNewScale()
  }

  //
  // Handle events (user inputs) in automap mode
  //
  private bigState = false
  responder(ev: DEvent): boolean {
    let rc = false

    if (!this.active) {
      if (ev.type === EvType.KeyDown && ev.data1 === START_KEY) {
        this.start()
        this.game.viewActive = false
        rc = true
      }
    } else if (ev.type === EvType.KeyDown) {
      if (this.player === null) {
        throw 'this.player = null'
      }

      rc = true
      let buffer: string
      switch (ev.data1) {
      case PAN_RIGHT_KEY:
        // pan right
        if (!this.followPlayer) {
          this.panInc.x = f2m(PAN_INC, this.scaleF2M)
        } else {
          rc = false
        }
        break
      case PAN_LEFT_KEY:
        // pan left
        if (!this.followPlayer) {
          this.panInc.x = -f2m(PAN_INC, this.scaleF2M)
        } else {
          rc = false
        }
        break
      case PAN_UP_KEY:
        // pan up
        if (!this.followPlayer) {
          this.panInc.y = f2m(PAN_INC, this.scaleF2M)
        } else {
          rc = false
        }
        break
      case PAN_DOWN_KEY:
        // pan down
        if (!this.followPlayer) {
          this.panInc.y = -f2m(PAN_INC, this.scaleF2M)
        } else {
          rc = false
        }
        break
      case ZOOM_OUT_KEY:
        // zoom out
        this.m2fZoomMul = ZOOM_OUT
        this.f2mZoomMul = ZOOM_IN
        break
      case ZOOM_IN_KEY:
        // zoom in
        this.m2fZoomMul = ZOOM_IN
        this.f2mZoomMul = ZOOM_OUT
        break
      case END_KEY:
        this.bigState = false
        this.game.viewActive = true
        this.stop()
        break
      case GO_BIG_KEY:
        this.bigState = !this.bigState
        if (this.bigState) {
          this.saveScaleAndLoc()
          this.minOutWindowScale()
        } else {
          this.restoreScaleAndLoc()
        }
        break
      case FOLLOW_KEY:
        this.followPlayer = !this.followPlayer
        this.oldLoc.x = 0x7fffffff
        this.player.message = this.followPlayer ?
          this.strings.amstrFollowon : this.strings.amstrFollowoff
        break
      case GRID_KEY:
        this.grid = !this.grid
        this.player.message = this.grid ?
          this.strings.amstrGridon : this.strings.amstrGridoff
        break
      case MARK_KEY:
        buffer = `${this.strings.amstrMarkedspot} ${this.markPointNum}`
        this.player.message = buffer
        this.addMark()
        break
      case CLEAR_MARK_KEY:
        this.clearMarks()
        this.player.message = this.strings.amstrMarkscleared
        break
      default:
        rc = false
      }
      // if (!this.game.deathMatch && cht_CheckCheat(cheat_amap, ev.data1)) {
      //   rc = false
      //   this.cheating = (this.cheating + 1) % 3
      // }
    } else if (ev.type === EvType.KeyUp) {
      rc = false
      switch (ev.data1) {
      case PAN_RIGHT_KEY:
        if (!this.followPlayer) {
          this.panInc.x = 0
        }
        break
      case PAN_LEFT_KEY:
        if (!this.followPlayer) {
          this.panInc.x = 0
        }
        break
      case PAN_UP_KEY:
        if (!this.followPlayer) {
          this.panInc.y = 0
        }
        break
      case PAN_DOWN_KEY:
        if (!this.followPlayer) {
          this.panInc.y = 0
        }
        break
      case ZOOM_OUT_KEY:
      case ZOOM_IN_KEY:
        this.m2fZoomMul = FRACUNIT
        this.f2mZoomMul = FRACUNIT
        break
      }
    }

    return rc

  }

  //
  // Zooming
  //
  private changeWindowScale(): void {
    // Change the scaling multipliers
    this.scaleM2F = mul(this.scaleM2F, this.m2fZoomMul)
    this.scaleF2M = div(FRACUNIT, this.scaleM2F)

    if (this.scaleM2F < this.minScaleM2F) {
      this.minOutWindowScale()
    } else if (this.scaleM2F > this.maxScaleM2F) {
      this.maxOutWindowScale()
    } else {
      this.activateNewScale()
    }
  }

  private doFollowPlayer(): void {
    if (this.player === null) {
      throw 'this.player = null'
    }
    if (this.player.mo === null) {
      throw 'this.player.mo = null'
    }

    if (this.oldLoc.x !== this.player.mo.x ||
      this.oldLoc.y !== this.player.mo.y) {
      this.mx = f2m(m2f(this.player.mo.x, this.scaleM2F), this.scaleF2M) -
          (this.mw / 2 >> 0)
      this.my = f2m(m2f(this.player.mo.y, this.scaleM2F), this.scaleF2M) -
          (this.mh / 2 >> 0)
      this.mx2 = this.mx + this.mw
      this.my2 = this.my + this.mh
      this.oldLoc.x = this.player.mo.x
      this.oldLoc.y = this.player.mo.y

      //  m_x = FTOM(MTOF(plr->mo->x - m_w/2));
      //  m_y = FTOM(MTOF(plr->mo->y - m_h/2));
      //  m_x = plr->mo->x - m_w/2;
      //  m_y = plr->mo->y - m_h/2;

    }

  }

  //
  // Updates on Game Tick
  //
  ticker(): void {
    if (!this.active) {
      return
    }

    if (this.followPlayer) {
      this.doFollowPlayer()
    }

    // Change the zoom if necessary
    if (this.f2mZoomMul !== FRACUNIT) {
      this.changeWindowScale()
    }

    // Change x,y location
    if (this.panInc.x || this.panInc.y) {
      this.changeWindowLoc()
    }

    // Update light level
    // AM_updateLightLev();

  }

  //
  // Clear automap frame buffer.
  //
  private clearFB(color: number): void {
    this.fb.set(new Array(this.fw * this.fh).fill(color))
  }

  //
  // Automap clipping of lines.
  //
  // Based on Cohen-Sutherland clipping algorithm but with a slightly
  // faster reject and precalculated slopes.  If the speed is needed,
  // use a hash algorithm to handle  the common cases.
  //
  private clipMLine(ml: Line, fl: Line): boolean {
    const enum Side {
      Left = 1,
      Right = 2,
      Bottom = 4,
      Top = 8,
    }
    const doOutCode = (mx: number, my: number): number => {
      let oc = 0
      if (my < 0) {
        oc |= Side.Top
      } else if (my >= this.fh) {
        oc |= Side.Bottom
      }
      if (mx < 0) {
        oc |= Side.Left
      } else if (mx >= this.fw) {
        oc |= Side.Right
      }

      return oc
    }

    let outCode1 = 0
    let outCode2 = 0

    // do trivial rejects and outCodes
    if (ml.a.y > this.my2) {
      outCode1 = Side.Top
    } else if (ml.a.y < this.my) {
      outCode1 = Side.Bottom
    }

    if (ml.b.y > this.my2) {
      outCode2 = Side.Top
    } else if (ml.b.y < this.my) {
      outCode2 = Side.Bottom
    }

    if (outCode1 & outCode2) {
      // trivially outside
      return false
    }

    if (ml.a.x < this.mx) {
      outCode1 |= Side.Left
    } else if (ml.a.x > this.mx2) {
      outCode1 |= Side.Right
    }

    if (ml.b.x < this.mx) {
      outCode2 |= Side.Left
    } else if (ml.b.x > this.mx2) {
      outCode2 |= Side.Right
    }

    if (outCode1 & outCode2) {
      // trivially outside
      return false
    }

    // transform to frame-buffer coordinates.
    fl.a.x = cxm2f(ml.a.x, this.scaleM2F, this.fx, this.mx)
    fl.a.y = cym2f(ml.a.y, this.scaleM2F, this.fy, this.fh, this.my)
    fl.b.x = cxm2f(ml.b.x, this.scaleM2F, this.fx, this.mx)
    fl.b.y = cym2f(ml.b.y, this.scaleM2F, this.fy, this.fh, this.my)

    outCode1 = doOutCode(fl.a.x, fl.a.y)
    outCode2 = doOutCode(fl.b.x, fl.b.y)

    if (outCode1 & outCode2) {
      return false
    }

    let outside: number
    const tmp = new Point()
    let dx: number
    let dy: number
    while (outCode1 | outCode2) {
      // may be partially inside box
      // find an outside point
      if (outCode1) {
        outside = outCode1
      } else {
        outside = outCode2
      }

      // clip to each side
      if (outside & Side.Top) {
        dy = fl.a.y - fl.b.y
        dx = fl.b.x - fl.a.x
        tmp.x = fl.a.x + (dx * fl.a.y / dy >> 0)
        tmp.y = 0
      } else if (outside & Side.Bottom) {
        dy = fl.a.y - fl.b.y
        dx = fl.b.x - fl.a.x
        tmp.x = fl.a.x + (dx * (fl.a.y - this.fh) / dy >> 0)
        tmp.y = this.fh - 1
      } else if (outside & Side.Right) {
        dy = fl.b.y - fl.a.y
        dx = fl.b.x - fl.a.x
        tmp.y = fl.a.y + (dy * (this.fw - 1 - fl.a.x) / dx >> 0)
        tmp.x = this.fw - 1
      } else if (outside & Side.Left) {
        dy = fl.b.y - fl.a.y
        dx = fl.b.x - fl.a.x
        tmp.y = fl.a.y + (dy * -fl.a.x / dx >> 0)
        tmp.x = 0
      }

      if (outside === outCode1) {
        fl.a = tmp
        outCode1 = doOutCode(fl.a.x, fl.a.y)
      } else {
        fl.b = tmp
        outCode2 = doOutCode(fl.b.x, fl.b.y)
      }

      if (outCode1 & outCode2) {
        // trivially outside
        return false
      }
    }

    return true

  }

  //
  // Classic Bresenham w/ whatever optimizations needed for speed
  //
  private fuck = 0
  private drawFLine(fl: Line, color: number): void {

    // For debugging only
    if (fl.a.x < 0 || fl.a.x >= this.fw ||
      fl.a.y < 0 || fl.a.y >= this.fh ||
      fl.b.x < 0 || fl.b.x >= this.fw ||
      fl.b.y < 0 || fl.b.y >= this.fh
    ) {
      console.error(`fuck ${this.fuck++}`)
      return
    }

    const putDot = (xx: number, yy: number, cc: number) => {
      this.fb[yy * this.fw + xx] = cc
    }

    const dx = fl.b.x - fl.a.x
    const ax = 2 * (dx < 0 ? -dx : dx)
    const sx = dx < 0 ? -1 : 1

    const dy = fl.b.y - fl.a.y
    const ay = 2 * (dy < 0 ? -dy : dy)
    const sy = dy < 0 ? -1 : 1

    let x = fl.a.x
    let y = fl.a.y

    let d: number
    if (ax > ay) {
      d = ay - (ax / 2 >> 0)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        putDot(x, y, color)
        if (x === fl.b.x) {
          return
        }
        if (d >= 0) {
          y += sy
          d -= ax
        }
        x += sx
        d += ay
      }
    } else {
      d = ax - ay / 2
      // eslint-disable-next-line no-constant-condition
      while (true) {
        putDot(x, y, color)
        if (y === fl.b.y) {
          return
        }
        if (d >= 0) {
          x += sx
          d -= ay
        }
        y += sy
        d += ax
      }
    }
  }

  //
  // Clip lines, draw visible part sof lines.
  //
  private drawMLine(ml: Line, color: number): void {
    const fl = new Line()

    if (this.clipMLine(ml, fl)) {
      // draws it on frame buffer using fb coords
      this.drawFLine(fl, color)
    }
  }

  //
  // Draws flat (floor/ceiling tile) aligned grid lines.
  //
  private drawGrid(color: number): void {
    const ml = new Line()

    // Figure out start of vertical gridlines
    let start = this.mx
    if ((start - this.level.blockMap.originX) % (MAP_BLOCK_UNITS << FRACBITS)) {
      start += (MAP_BLOCK_UNITS << FRACBITS) -
        (start - this.level.blockMap.originX) % (MAP_BLOCK_UNITS << FRACBITS)
    }
    let end = this.mx + this.mw

    // draw vertical gridlines
    ml.a.y = this.my
    ml.b.y = this.my + this.mh
    for (let x = start; x < end; x += MAP_BLOCK_UNITS << FRACBITS) {
      ml.a.x = x
      ml.b.x = x
      this.drawMLine(ml, color)
    }

    // Figure out start of horizontal gridlines
    start = this.my
    if ((start - this.level.blockMap.originY) % (MAP_BLOCK_UNITS << FRACBITS)) {
      start += (MAP_BLOCK_UNITS << FRACBITS) -
        (start - this.level.blockMap.originY) % (MAP_BLOCK_UNITS << FRACBITS)
    }
    end = this.my + this.mh

    // draw horizontal gridlines
    ml.a.x = this.mx
    ml.b.x = this.mx + this.mw
    for (let y = start; y < end; y += MAP_BLOCK_UNITS << FRACBITS) {
      ml.a.y = y
      ml.b.y = y
      this.drawMLine(ml, color)
    }

  }

  //
  // Determines visible lines, draws them.
  // This is LineDef based, not LineSeg based.
  //
  private drawWalls(): void {
    const l = new Line()

    const lines = this.level.lines
    let line = lines[0]

    for (let i = 0; i < this.level.lines.length; i++) {
      line = lines[i]
      l.a.x = line.v1.x
      l.a.y = line.v1.y
      l.b.x = line.v2.x
      l.b.y = line.v2.y
      if (this.cheating || line.flags & MapLineFlag.Mapped) {
        if (line.flags & LINE_NEVERSEE && !this.cheating) {
          continue
        }
        if (!line.backSector) {
          this.drawMLine(l, WALL_COLORS + this.lightLev)
        } else {
          if (line.special === 39) {
            // teleporters
            this.drawMLine(l, WALL_COLORS + WALL_RANGE / 2)
          } else if (line.flags & MapLineFlag.Secret) {
            // secret door
            if (this.cheating) {
              this.drawMLine(l, SECRET_WALL_COLORS + this.lightLev)
            } else {
              this.drawMLine(l, WALL_COLORS + this.lightLev)
            }
          } else if (line.frontSector &&
            line.backSector.floorHeight !== line.frontSector.floorHeight) {
            // floor level change
            this.drawMLine(l, FD_WALL_COLORS + this.lightLev)
          } else if (line.frontSector &&
            line.backSector.ceilingHeight !== line.frontSector.ceilingHeight) {
            // ceiling level change
            this.drawMLine(l, CD_WALL_COLORS + this.lightLev)
          } else if (this.cheating) {
            this.drawMLine(l, TS_WALL_COLORS + this.lightLev)
          }
        }
      } else if (this.player && this.player.powers[PowerType.AllMap]) {
        if (!(lines[i].flags & LINE_NEVERSEE)) {
          this.drawMLine(l, GRAYS + 3)
        }
      }
    }

  }

  //
  // Rotation in 2D.
  // Used to rotate player arrow line character.
  //
  private rotate(pt: Point, a: number): void {
    const tmpX = mul(pt.x, fineSine[FINE_ANGLES / 4 + (a >>> ANGLE_TO_FINE_SHIFT)]) -
      mul(pt.y, fineSine[a >>> ANGLE_TO_FINE_SHIFT])

    pt.y = mul(pt.x, fineSine[a >>> ANGLE_TO_FINE_SHIFT]) +
      mul(pt.y, fineSine[FINE_ANGLES / 4 + (a >>> ANGLE_TO_FINE_SHIFT)])

    pt.x = tmpX
  }

  private drawLineCharacter(
    lineGuy: Line[],
    lineGuyLines: number,
    scale: number,
    angle: number,
    color: number,
    x: number,
    y: number,
  ): void {
    const l = new Line()

    for (let i = 0; i < lineGuyLines; i++) {
      l.a.x = lineGuy[i].a.x
      l.a.y = lineGuy[i].a.y

      if (scale) {
        l.a.x = mul(scale, l.a.x)
        l.a.y = mul(scale, l.a.y)
      }

      if (angle) {
        this.rotate(l.a, angle)
      }

      l.a.x += x
      l.a.y += y

      l.b.x = lineGuy[i].b.x
      l.b.y = lineGuy[i].b.y

      if (scale) {
        l.b.x = mul(scale, l.b.x)
        l.b.y = mul(scale, l.b.y)
      }

      if (angle) {
        this.rotate(l.b, angle)
      }

      l.b.x += x
      l.b.y += y

      this.drawMLine(l, color)
    }
  }

  private drawPlayers(): void {
    if (!this.game.netGame) {
      if (this.player === null) {
        throw 'this.player = null'
      }
      if (this.player.mo === null) {
        throw 'this.player.mo = null'
      }
      if (this.cheating) {
        this.drawLineCharacter(
          cheatPlayerArrow, cheatPlayerArrow.length, 0,
          this.player.mo.angle, WHITE, this.player.mo.x, this.player.mo.y)
      } else {
        this.drawLineCharacter(
          playerArrow, playerArrow.length, 0,
          this.player.mo.angle, WHITE, this.player.mo.x, this.player.mo.y)
      }
      return
    }

    let p: Player
    let color: number
    let theirColor = -1
    const theirColors = [ GREENS, GRAYS, BROWNS, REDS ]

    for (let i = 0; i < MAX_PLAYERS; i++) {
      theirColor++
      p = this.game.players[i]

      if (this.game.deathMatch && !this.game.singleDemo &&
        p !== this.player
      ) {
        continue
      }

      if (!this.game.playerInGame[i]) {
        continue
      }

      if (p.powers[PowerType.Invisibility]) {
        // *close* to black
        color = 246
      } else {
        color = theirColors[theirColor]
      }

      if (p.mo === null) {
        throw 'p.mo = null'
      }

      this.drawLineCharacter(playerArrow, playerArrow.length, 0,
        p.mo.angle, color, p.mo.x, p.mo.y)
    }

  }

  private drawThings(colors: number): void {
    const sectors = this.level.sectors
    let t: MObj | null
    for (let i = 0; i < this.level.sectors.length; i++) {
      t = sectors[i].thingList
      while (t) {
        this.drawLineCharacter(thinTriangleGuy, thinTriangleGuy.length,
          16 << FRACBITS, t.angle, colors + this.lightLev, t.x, t.y)
        t = t.sNext
      }
    }
  }

  private drawMarks(): void {
    let fx: number
    let fy: number
    let w: number
    let h: number

    for (let i = 0; i < NUM_MARK_POINTS; i++) {
      if (this.markPoints[i].x !== -1) {
        //      w = SHORT(marknums[i]->width);
        //      h = SHORT(marknums[i]->height);
        // because something's wrong with the wad, i guess
        w = 5
        // because something's wrong with the wad, i guess
        h = 6
        fx = cxm2f(this.markPoints[i].x, this.scaleM2F, this.fx, this.mx)
        fy = cym2f(this.markPoints[i].y, this.scaleM2F, this.fy, this.fh, this.my)
        if (fx >= this.fx && fx <= this.fw - w && fy >= this.fy && fy <= this.fh - h) {
          this.rVideo.drawPatch(fx, fy, FB, this.markNums[i])
        }
      }
    }

  }

  private drawCrossHair(color: number): void {
    // single point for now
    this.fb[this.fw * (this.fh + 1) / 2 >> 0] = color
  }

  drawer(): void {
    if (!this.active) {
      return
    }

    this.clearFB(BACKGROUND)
    if (this.grid) {
      this.drawGrid(GRID_COLORS)
    }
    this.drawWalls()
    this.drawPlayers()
    if (this.cheating === 2) {
      this.drawThings(THING_COLORS)
    }
    this.drawCrossHair(XHAIR_COLORS)

    this.drawMarks()
  }
}
