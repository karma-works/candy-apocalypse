import { Anim, AnimType, NUM_ANIMS, anims } from './anim'
import { GameMode, GameVersion, Language } from '../doom/mode'
import { MAX_PLAYERS, SCREENHEIGHT, SCREENWIDTH, TICRATE } from '../global/doomdef'
import { WbPlayer, WbStart } from '../doom/player'
import { ButtonCode } from '../doom/event'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom'
import { Game } from '../game/game'
import { LumpReader } from '../wad/lump-reader'
import { Patch } from '../rendering/defs/patch'
import { Sfx } from '../doom/sounds/sfx'
import { Video } from '../rendering/video'
import { lNodes } from './point'
import { random } from '../misc/random'

const enum State {
  NoState = -1,
  StatCount,
  ShowNextLoc,
}

//
// Different vetween registered DOOM (1994) and
//  Ultimate DOOM - Final edition (retail, 1995?).
// This is supposedly ignored for commercial
//  release (aka DOOM II), which had 34 maps
//  in one episode. So there.
const NUM_MAPS = 9

// GLOBAL LOCATIONS
const WI_TITLEY = 2

// SINGPLE-PLAYER STUFF
const SP_STATSX = 50
const SP_STATSY = 50

const SP_TIMEX = 16
const SP_TIMEY = SCREENHEIGHT - 32


// in seconds
const SHOW_NEXT_LOC_DELAY = 4

//
// Animation locations for episode 0 (1).
// Using patches saves a lot of space,
//  as they replace 320x200 full screen frames.
//
export class Win {

  // used to accelerate or skip a stage
  private accelerateStage = 0

  // wbs->pnum
  private me = 0

  // specifies current state
  private state: State = 0

  // contains information passed into intermission
  private wbs = new WbStart()

  private players = new Array<WbPlayer>()

  // used for general timing
  private cnt = 0

  // used for timing of background animation
  private bCnt = 0

  // signals to refresh everything for one frame
  private firstRefresh = 0

  private cntKills = new Array<number>(MAX_PLAYERS).fill(0)
  private cntItems = new Array<number>(MAX_PLAYERS).fill(0)
  private cntSecret = new Array<number>(MAX_PLAYERS).fill(0)
  private cntTime = 0
  private cntPar = 0
  private cntPause = 0

  // # of commercial levels
  private numCMaps = 0

  //
  // GRAPHICS
  //

  // background (map of levels).
  private bg = new Patch()

  // You Are Here graphic
  private yah = [ new Patch(), new Patch() ]

  // splat
  private splat = new Patch()


  // %, : graphics
  private percent = new Patch()
  private colon = new Patch()

  // 0-9 graphic
  private num = new Array<Patch>()

  // minus sign
  private wiMinus = new Patch()

  // "Finished!" graphics
  private finished = new Patch()

  // "Entering" graphic
  private entering = new Patch()

  // "secret"
  private spSecret = new Patch()

  // "Kills", "Scrt", "Items", "Frags"
  private kills = new Patch()
  private secret = new Patch()
  private items = new Patch()
  private frags = new Patch()

  // Time sucks.
  private time = new Patch()
  private par = new Patch()
  private sucks = new Patch()

  // "killers", "victims"
  private killers = new Patch()
  private victims = new Patch()

  // "Total", your face, your dead face
  private total = new Patch()
  private star = new Patch()
  private bStar = new Patch()

  // "red P[1..MAXPLAYERS]"
  private p = new Array<Patch>()

  // "gray P[1..MAXPLAYERS]"
  private bp = new Array<Patch>()

  // Name graphics of each level (centered)
  private lNames = new Array<Patch>()

  private get dSound(): DSound {
    return this.doom.dSound
  }
  private get game(): Game {
    return this.doom.game
  }
  private get rVideo(): Video {
    return this.doom.rendering.video
  }
  private get wad(): LumpReader {
    return this.doom.wad
  }

  constructor(private doom: Doom) { }

  // slam background
  // UNUSED static unsigned char *background=0;
  private slamBackground(): void {
    this.rVideo.screens[0].set(this.rVideo.screens[1])
  }

  // Draws "<Levelname> Finished!"
  private drawLF(): void {
    let y = WI_TITLEY

    // draw <LevelName>
    this.rVideo.drawPatch(
      (SCREENWIDTH - this.lNames[this.wbs.last].width) / 2, y, 0,
      this.lNames[this.wbs.last],
    )
    // draw "Finished!"
    y += 5 * this.lNames[this.wbs.next].height / 4

    this.rVideo.drawPatch(
      (SCREENWIDTH - this.finished.width) / 2, y, 0,
      this.finished,
    )
  }


  // Draws "Entering <LevelName>"
  private drawEL(): void {
    let y = WI_TITLEY

    // draw "Entering"
    this.rVideo.drawPatch(
      (SCREENWIDTH - this.entering.width) / 2, y, 0,
      this.entering,
    )
    // draw level
    y += 5 * this.lNames[this.wbs.next].height / 4

    this.rVideo.drawPatch(
      (SCREENWIDTH - this.lNames[this.wbs.next].width) / 2, y, 0,
      this.lNames[this.wbs.next],
    )
  }

  private drawOnLNode(n: number, c: Patch[]): void {
    let i = 0
    let left: number
    let top: number
    let right: number
    let bottom: number
    let fits = false

    do {
      left = lNodes[this.wbs.episode][n].x - c[i].leftOffset
      top = lNodes[this.wbs.episode][n].y - c[i].topOffset
      right = left + c[i].width
      bottom = top + c[i].height

      if (left >= 0 &&
        right < SCREENWIDTH &&
        top >= 0 &&
        bottom < SCREENHEIGHT
      ) {
        fits = true
      } else {
        i++
      }
    } while (!fits && i !== 2)

    if (fits && i < 2) {
      this.rVideo.drawPatch(
        lNodes[this.wbs.episode][n].x,
        lNodes[this.wbs.episode][n].y,
        0,
        c[i],
      )
    } else {
      console.log(`Could not place patch on level ${n + 1}`)
    }
  }

  private initAnimatedBack(): void {
    if (this.doom.gameMode === GameMode.Commercial) {
      return
    }

    if (this.wbs.episode > 2) {
      return
    }

    let a: Anim
    for (let i = 0; i < NUM_ANIMS[this.wbs.episode]; ++i) {
      a = anims[this.wbs.episode][i]

      // init variables
      a.ctr = -1

      // specify the next time to draw it
      if (a.type === AnimType.Always) {
        a.nextTic = this.bCnt + 1 +
          random.mRandom() % a.period
      } else if (a.type === AnimType.Random) {
        a.nextTic = this.bCnt + a.data2 +
          random.mRandom() % a.data1
      } else if (a.type === AnimType.Level) {
        a.nextTic = this.bCnt + 1
      }
    }
  }

  private updateAnimatedBack(): void {
    if (this.doom.gameMode === GameMode.Commercial) {
      return
    }

    if (this.wbs.episode > 2) {
      return
    }

    let a: Anim
    for (let i = 0; i < NUM_ANIMS[this.wbs.episode]; ++i) {
      a = anims[this.wbs.episode][i]

      switch (a.type) {
      case AnimType.Always:
        if (++a.ctr >= a.nAnims) {
          a.ctr = 0
        }
        a.nextTic = this.bCnt + a.period
        break
      case AnimType.Random:
        a.ctr++
        if (a.ctr === a.nAnims) {
          a.ctr = -1
          a.nextTic = this.bCnt + a.data2 +
            random.mRandom() % a.data1
        } else {
          a.nextTic = this.bCnt + a.period
        }
        break
      case AnimType.Level:
        // gawd-awful hack for level anims
        if (!(this.state === State.StatCount &&
          i === 7) &&
          this.wbs.next === a.data1
        ) {
          a.ctr++
          if (a.ctr === a.nAnims) {
            a.ctr--
          }
          a.nextTic = this.bCnt + a.period
        }
        break
      }
    }
  }

  private drawAnimatedBack(): void {
    if (this.doom.gameMode === GameMode.Commercial) {
      return
    }

    if (this.wbs.episode > 2) {
      return
    }

    let a: Anim
    for (let i = 0; i < NUM_ANIMS[this.wbs.episode]; ++i) {
      a = anims[this.wbs.episode][i]

      if (a.ctr >= 0) {
        this.rVideo.drawPatch(a.loc.x, a.loc.y, 0, a.p[a.ctr])
      }
    }
  }

  //
  // Draws a number.
  // If digits > 0, then use that many digits minimum,
  //  otherwise only use as many as necessary.
  // Returns new x position.
  //
  private drawNum(x: number, y: number, n: number, digits: number): number {
    const fontWidth = this.num[0].width

    if (digits < 0) {
      if (!n) {
        // make variable-length zeros 1 digit long
        digits = 1
      } else {
        // figure out # of digits in #
        digits = 0
        let temp = n

        while (temp) {
          temp = temp / 10 >> 0
          digits++
        }
      }
    }

    const neg = n < 0

    if (neg) {
      n = -n
    }

    // if non-number, do not draw it
    if (n === 1994) {
      debugger
      return 0
    }

    // draw the new number
    while (digits--) {
      x -= fontWidth
      this.rVideo.drawPatch(x, y, 0, this.num[n % 10])
      n = n / 10 >> 0
    }

    // draw a minus sign if necessary
    if (neg) {
      this.rVideo.drawPatch(x -= 8, y, 0, this.wiMinus)
    }

    return x
  }

  private drawPercent(x: number, y: number, p: number): void {
    if (p < 0) {
      return
    }

    this.rVideo.drawPatch(x, y, 0, this.percent)
    this.drawNum(x, y, p, -1)
  }

  //
  // Display level completion time and par,
  //  or "sucks" message if overflow.
  //
  private drawTime(x: number, y: number, t: number): void {
    if (t < 0) {
      return
    }

    if (t <= 61 * 59) {
      let div = 1
      let n: number

      do {
        n = (t / div >> 0) % 60
        x = this.drawNum(x, y, n, 2) - this.colon.width
        div *= 60

        // draw
        if (div === 60 || t / div >> 0) {
          this.rVideo.drawPatch(x, y, 0, this.colon)
        }
      } while (t / div >> 0)
    } else {
      // "sucks"
      this.rVideo.drawPatch(x - this.sucks.width, y, 0, this.sucks)
    }
  }

  private initNoState(): void {
    this.state = State.NoState
    this.accelerateStage = 0
    this.cnt = 10
  }

  private updateNoState(): void {
    this.updateAnimatedBack()

    if (!--this.cnt) {
      this.game.worldDone()
    }
  }

  snlPointerOn = false

  private initShowNextLoc(): void {
    this.state = State.ShowNextLoc
    this.accelerateStage = 0
    this.cnt = SHOW_NEXT_LOC_DELAY * TICRATE

    this.initAnimatedBack()
  }

  private updateShowNextLoc(): void {
    this.updateAnimatedBack()

    if (!--this.cnt || this.accelerateStage) {
      this.initNoState()
    } else {
      this.snlPointerOn = (this.cnt & 31) < 20
    }
  }

  private drawShowNextLoc(): void {
    this.slamBackground()

    // draw animated background
    this.drawAnimatedBack()

    if (this.doom.gameMode !== GameMode.Commercial) {
      if (this.wbs.episode > 2) {
        this.drawEL()
        return
      }

      const last = this.wbs.last === 8 ? this.wbs.next - 1 : this.wbs.last

      // draw a splat on taken cities.
      for (let i=0; i <= last; i++) {
        this.drawOnLNode(i, [ this.splat ])
      }

      // splat the secret level?
      if (this.wbs.didSecret) {
        this.drawOnLNode(8, [ this.splat ])
      }

      // draw flashing ptr
      if (this.snlPointerOn) {
        this.drawOnLNode(this.wbs.next, this.yah)
      }
    }

    // draws which level you are entering..
    if (this.doom.gameMode !== GameMode.Commercial ||
      this.wbs.next !== 30
    ) {
      this.drawEL()
    }
  }

  private drawNoState(): void {
    this.snlPointerOn = true
    this.drawShowNextLoc()
  }

  private initDeathMatchStats(): void {
    debugger
  }

  private updateDeathMatchStats(): void {
    debugger
  }

  private drawDeathMatchStats(): void {
    debugger
  }
  private initNetGameStats(): void {
    debugger
  }

  private updateNetGameStats(): void {
    debugger
  }

  private drawNetGameStats(): void {
    debugger
  }


  private spState = 0

  private initStats(): void {
    this.state = State.StatCount
    this.accelerateStage = 0
    this.spState = 1
    this.cntKills[0] =
      this.cntItems[0] =
      this.cntSecret[0] = -1
    this.cntTime = this.cntPar = -1
    this.cntPause = TICRATE

    this.initAnimatedBack()
  }

  private updateStats(): void {
    this.updateAnimatedBack()

    if (this.accelerateStage && this.spState !== 10) {
      this.accelerateStage = 0
      this.cntKills[0] = this.players[this.me].sKills * 100 / this.wbs.maxKills >> 0
      this.cntItems[0] = this.players[this.me].sItems * 100 / this.wbs.maxItems >> 0
      this.cntSecret[0] = this.players[this.me].sSecret * 100 / this.wbs.maxSecret >> 0
      this.cntTime = this.players[this.me].sTime / TICRATE >> 0
      this.cntPar = this.wbs.parTime / TICRATE >> 0
      this.dSound.startSound(null, Sfx.Barexp)
      this.spState = 10
    }

    if (this.spState === 2) {
      this.cntKills[0] += 2

      if (!(this.bCnt & 3)) {
        this.dSound.startSound(null, Sfx.Pistol)
      }

      if (this.cntKills[0] >= this.players[this.me].sKills * 100 / this.wbs.maxKills >> 0) {
        this.cntKills[0] = this.players[this.me].sKills * 100 / this.wbs.maxKills >> 0
        this.dSound.startSound(null, Sfx.Barexp)
        this.spState++
      }
    } else if (this.spState === 4) {
      this.cntItems[0] += 2

      if (!(this.bCnt & 3)) {
        this.dSound.startSound(null, Sfx.Pistol)
      }

      if (this.cntItems[0] >= this.players[this.me].sItems * 100 / this.wbs.maxItems >> 0) {
        this.cntItems[0] = this.players[this.me].sItems * 100 / this.wbs.maxItems >> 0
        this.dSound.startSound(null, Sfx.Barexp)
        this.spState++
      }
    } else if (this.spState === 6) {
      this.cntSecret[0] += 2

      if (!(this.bCnt & 3)) {
        this.dSound.startSound(null, Sfx.Pistol)
      }

      if (this.cntSecret[0] >= this.players[this.me].sSecret * 100 / this.wbs.maxSecret >> 0) {
        this.cntSecret[0] = this.players[this.me].sSecret * 100 / this.wbs.maxSecret >> 0
        this.dSound.startSound(null, Sfx.Barexp)
        this.spState++
      }
    } else if (this.spState === 8) {
      this.cntTime += 3

      if (!(this.bCnt & 3)) {
        this.dSound.startSound(null, Sfx.Pistol)
      }

      if (this.cntTime >= this.players[this.me].sTime / TICRATE >> 0) {
        this.cntTime = this.players[this.me].sTime / TICRATE >> 0
      }

      this.cntPar += 3

      if (this.cntPar >= this.wbs.parTime / TICRATE >> 0) {
        this.cntPar = this.wbs.parTime / TICRATE >> 0

        if (this.cntTime >= this.players[this.me].sTime / TICRATE >> 0) {
          this.dSound.startSound(null, Sfx.Barexp)
          this.spState++
        }
      }
    } else if (this.spState === 10) {
      if (this.accelerateStage) {
        this.dSound.startSound(null, Sfx.Sgcock)
        if (this.doom.gameMode === GameMode.Commercial) {
          this.initNoState()
        } else {
          this.initShowNextLoc()
        }
      }
    } else if (this.spState & 1) {
      if (!--this.cntPause) {
        this.spState++
        this.cntPause = TICRATE
      }
    }


  }

  private drawStats(): void {
    // line height
    const lh = 3 * this.num[0].height / 2 >> 0

    this.slamBackground()

    // draw animated background
    this.drawAnimatedBack()

    this.drawLF()

    this.rVideo.drawPatch(SP_STATSX, SP_STATSY, 0, this.kills)
    this.drawPercent(SCREENWIDTH - SP_STATSX, SP_STATSY, this.cntKills[0])

    this.rVideo.drawPatch(SP_STATSX, SP_STATSY + lh, 0, this.items)
    this.drawPercent(SCREENWIDTH - SP_STATSX, SP_STATSY + lh, this.cntItems[0])

    this.rVideo.drawPatch(SP_STATSX, SP_STATSY + 2 * lh, 0, this.spSecret)
    this.drawPercent(SCREENWIDTH - SP_STATSX, SP_STATSY + 2 * lh, this.cntSecret[0])

    this.rVideo.drawPatch(SP_TIMEX, SP_TIMEY, 0, this.time)
    this.drawTime(SCREENWIDTH / 2 - SP_TIMEX, SP_TIMEY, this.cntTime)

    if (this.wbs.episode < 3) {
      this.rVideo.drawPatch(SCREENWIDTH / 2 + SP_TIMEX, SP_TIMEY, 0, this.par)
      this.drawTime(SCREENWIDTH - SP_TIMEX, SP_TIMEY, this.cntPar)
    }
  }

  private checkForAccelerate(): void {
    // check for button presses to skip delays
    for (let i = 0, player = this.game.players[i];
      i < MAX_PLAYERS;
      ++i, player = this.game.players[i]
    ) {
      if (this.game.playerInGame[i]) {
        if (player.cmd.buttons & ButtonCode.Attack) {
          if (!player.attackDown) {
            this.accelerateStage = 1
          }
          player.attackDown = true
        } else {
          player.attackDown = false
        }
        if (player.cmd.buttons & ButtonCode.Use) {
          if (!player.useDown) {
            this.accelerateStage = 1
          }
          player.useDown = true
        } else {
          player.useDown = false
        }
      }
    }
  }

  // Updates stuff each tick
  ticker(): void {
    // counter for general background animation
    this.bCnt++

    this.checkForAccelerate()

    switch (this.state) {
    case State.StatCount:
      if (this.game.deathMatch) {
        this.updateDeathMatchStats()
      } else if (this.game.netGame) {
        this.updateNetGameStats()
      } else {
        this.updateStats()
      }
      break
    case State.ShowNextLoc:
      this.updateShowNextLoc()
      break
    case State.NoState:
      this.updateNoState()
      break
    }
  }

  private loadData(): void {
    let name: string
    if (this.doom.gameMode === GameMode.Commercial) {
      name = 'INTERPIC'
    } else if (this.doom.gameVersion >= GameVersion.Ultimate &&
      this.wbs.episode === 3
    ) {
      name = 'INTERPIC'
    } else {
      name = `WIMAP${this.wbs.episode}`
    }

    // background
    this.bg = this.wad.cacheLumpName(name, Patch)
    this.rVideo.drawPatch(0, 0, 1, this.bg)

    if (this.doom.gameMode === GameMode.Commercial) {
      this.numCMaps = 32
      this.lNames = new Array(this.numCMaps)

      for (let i = 0; i < this.numCMaps; ++i) {
        name = `CWILV${i.toString().padStart(2, ' ')}`
        debugger
        this.lNames[i] = this.wad.cacheLumpName(name, Patch)
      }
    } else {
      this.lNames = new Array(NUM_MAPS)

      for (let i = 0; i < NUM_MAPS; ++i) {
        name = `WILV${this.wbs.episode}${i}`
        this.lNames[i] = this.wad.cacheLumpName(name, Patch)
      }

      // you are here
      this.yah[0] = this.wad.cacheLumpName('WIURH0', Patch)

      // you are here (alt.)
      this.yah[1] = this.wad.cacheLumpName('WIURH1', Patch)

      // splat
      this.splat = this.wad.cacheLumpName('WISPLAT', Patch)

      if (this.wbs.episode < 3) {
        let a: Anim
        for (let j = 0; j < NUM_ANIMS[this.wbs.episode]; ++j) {
          a = anims[this.wbs.episode][j]
          for (let i = 0; i < a.nAnims; ++i) {
            // MONDO HACK!
            if (this.wbs.episode !== 1 || j !== 8) {
              // animations
              name = `WIA${this.wbs.episode}${j.toString().padStart(2, '0')}${i.toString().padStart(2, '0')}`
              a.p[i] = this.wad.cacheLumpName(name, Patch)
            } else {
              // HACK ALERT!
              debugger
              a.p[i] = anims[1][4].p[i]
            }
          }
        }
      }
    }


    // More hacks on minus sign.
    this.wiMinus = this.wad.cacheLumpName('WIMINUS', Patch)

    for (let i = 0; i < 10; i++) {
      // numbers 0-9
      name = `WINUM${i}`
      this.num[i] = this.wad.cacheLumpName(name, Patch)
    }

    // percent sign
    this.percent = this.wad.cacheLumpName('WIPCNT', Patch)

    // "finished"
    this.finished = this.wad.cacheLumpName('WIF', Patch)

    // "entering"
    this.entering = this.wad.cacheLumpName('WIENTER', Patch)

    // "kills"
    this.kills = this.wad.cacheLumpName('WIOSTK', Patch)

    // "scrt"
    this.secret = this.wad.cacheLumpName('WIOSTS', Patch)

    // "secret"
    this.spSecret = this.wad.cacheLumpName('WISCRT2', Patch)

    // Yuck.
    if (this.doom.language === Language.French) {
      // "items"
      if (this.game.netGame && !this.game.deathMatch) {
        this.items = this.wad.cacheLumpName('WIOBJ', Patch)
      } else {
        this.items = this.wad.cacheLumpName('WIOSTI', Patch)
      }
    } else {
      this.items = this.wad.cacheLumpName('WIOSTI', Patch)
    }

    // "frgs"
    this.frags = this.wad.cacheLumpName('WIFRGS', Patch)

    // ":"
    this.colon = this.wad.cacheLumpName('WICOLON', Patch)

    // "time"
    this.time = this.wad.cacheLumpName('WITIME', Patch)

    // "sucks"
    this.sucks = this.wad.cacheLumpName('WISUCKS', Patch)

    // "par"
    this.par = this.wad.cacheLumpName('WIPAR', Patch)

    // "killers" (vertical)
    this.killers = this.wad.cacheLumpName('WIKILRS', Patch)

    // "victims" (horiz)
    this.victims = this.wad.cacheLumpName('WIVCTMS', Patch)

    // "total"
    this.total = this.wad.cacheLumpName('WIMSTT', Patch)

    // your face
    this.star = this.wad.cacheLumpName('STFST01', Patch)

    // dead face
    this.bStar = this.wad.cacheLumpName('STFDEAD0', Patch)

    for (let i = 0; i < MAX_PLAYERS; i++) {
      // "1,2,3,4"
      name = `STPB${i}`
      this.p[i] = this.wad.cacheLumpName(name, Patch)

      // "1,2,3,4"
      name = `WIBP${i + 1}`
      this.bp[i] = this.wad.cacheLumpName(name, Patch)
    }
  }

  drawer(): void {
    switch (this.state) {
    case State.StatCount:
      if (this.game.deathMatch) {
        this.drawDeathMatchStats()
      } else if (this.game.netGame) {
        this.drawNetGameStats()
      } else {
        this.drawStats()
      }
      break
    case State.ShowNextLoc:
      this.drawShowNextLoc()
      break
    case State.NoState:
      this.drawNoState()
      break
    }
  }

  private initVariables(wbStart: WbStart): void {
    this.wbs = wbStart

    this.accelerateStage = 0
    this.cnt = this.bCnt = 0
    this.firstRefresh = 1
    this.me = this.wbs.pNum
    this.players = this.wbs.players

    if (!this.wbs.maxKills) {
      this.wbs.maxKills = 1
    }

    if (!this.wbs.maxItems) {
      this.wbs.maxItems = 1
    }

    if (!this.wbs.maxSecret) {
      this.wbs.maxSecret = 1
    }

    if (this.doom.gameVersion < GameVersion.Ultimate) {
      if (this.wbs.episode > 2) {
        this.wbs.episode -= 3
      }
    }
  }

  start(wbStart: WbStart): void {
    this.initVariables(wbStart)
    this.loadData()

    if (this.game.deathMatch) {
      this.initDeathMatchStats()
    } else if (this.game.netGame) {
      this.initNetGameStats()
    } else {
      this.initStats()
    }
  }
}
