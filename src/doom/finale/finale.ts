import { DEvent, EvType, GameAction } from '../doom/event'
import { GameMission, GameMode, GameVersion } from '../doom/mode'
import { GameState, MAX_PLAYERS, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { AutoMap } from '../auto-map/auto-map'
import { Doom } from '../doom'
import { FF_FRAMEMASK } from '../play/sprite'
import { Game } from '../game/game'
import { HeadsUp } from '../heads-up/stuff'
import { LumpReader } from '../wad/lump-reader'
import { MObj } from '../play/mobj/mobj'
import { MObjInfo } from '../doom/info/mobj-info'
import { MObjType } from '../doom/info/mobj-type'
import { Patch } from '../rendering/defs/patch'
import { Post } from '../rendering/defs/post'
import { Data as RData } from '../rendering/data'
import { Video as RVideo } from '../rendering/video'
import { SfxName } from '../doom/sounds/sfx-name'
import { Sound } from '../doom/sound'
import { SpriteArray } from '../sprites/sprite-array'
import { SpriteDefsArray } from '../sprites/sprite-defs-array'
import { State } from '../doom/info/state'
import { StateNum } from '../doom/info/state-num'
import { Strings } from '../translation/strings'
import { mObjInfos } from '../doom/info/mobj-infos'
import { states } from '../doom/info/states'

const TEXT_SPEED = 3
const TEXT_WAIT = 250

const enum Stage {
  Text,
  ArtScreen,
  CharacterCast
}

interface TextScreen {
  mission: GameMission
  episode: number
  level: number
  background: string
  text: string
}

export class Finale {

  // Stage of animation:
  private stage: Stage = 0
  private count = 0

  private text = ''
  private flat = ''

  private textScreens: readonly TextScreen[]
  private newTextScreens() {
    return [
      { mission: GameMission.Doom, episode: 1, level: 8,
        background: 'FLOOR4_8',text: this.strings.e1text },
      { mission: GameMission.Doom, episode: 2, level: 8,
        background: 'SFLR6_1', text: this.strings.e2text },
      { mission: GameMission.Doom, episode: 3, level: 8,
        background: 'MFLR8_4', text: this.strings.e3text },
      { mission: GameMission.Doom, episode: 4, level: 8,
        background: 'MFLR8_3', text: this.strings.e4text },

      { mission: GameMission.Doom2, episode: 1, level: 6,
        background: 'SLIME16', text: this.strings.c1text },
      { mission: GameMission.Doom2, episode: 1, level: 11,
        background: 'RROCK14', text: this.strings.c2text },
      { mission: GameMission.Doom2, episode: 1, level: 20,
        background: 'RROCK07', text: this.strings.c3text },
      { mission: GameMission.Doom2, episode: 1, level: 30,
        background: 'RROCK17', text: this.strings.c4text },
      { mission: GameMission.Doom2, episode: 1, level: 15,
        background: 'RROCK13', text: this.strings.c5text },
      { mission: GameMission.Doom2, episode: 1, level: 31,
        background: 'RROCK19', text: this.strings.c6text },

      { mission: GameMission.PackTNT, episode: 1, level: 6,
        background: 'SLIME16', text: this.strings.t1text },
      { mission: GameMission.PackTNT, episode: 1, level: 11,
        background: 'RROCK14', text: this.strings.t2text },
      { mission: GameMission.PackTNT, episode: 1, level: 20,
        background: 'RROCK07', text: this.strings.t3text },
      { mission: GameMission.PackTNT, episode: 1, level: 30,
        background: 'RROCK17', text: this.strings.t4text },
      { mission: GameMission.PackTNT, episode: 1, level: 15,
        background: 'RROCK13', text: this.strings.t5text },
      { mission: GameMission.PackTNT, episode: 1, level: 31,
        background: 'RROCK19', text: this.strings.t6text },

      { mission: GameMission.PackPlut, episode: 1, level: 6,
        background: 'SLIME16', text: this.strings.p1text },
      { mission: GameMission.PackPlut, episode: 1, level: 11,
        background: 'RROCK14', text: this.strings.p2text },
      { mission: GameMission.PackPlut, episode: 1, level: 20,
        background: 'RROCK07', text: this.strings.p3text },
      { mission: GameMission.PackPlut, episode: 1, level: 30,
        background: 'RROCK17', text: this.strings.p4text },
      { mission: GameMission.PackPlut, episode: 1, level: 15,
        background: 'RROCK13', text: this.strings.p5text },
      { mission: GameMission.PackPlut, episode: 1, level: 31,
        background: 'RROCK19', text: this.strings.p6text },
    ]
  }

  private get autoMap(): AutoMap {
    return this.doom.autoMap
  }
  private get dSound(): Sound {
    return this.doom.dSound
  }
  private get game(): Game {
    return this.doom.game
  }
  private get headsUp(): HeadsUp {
    return this.doom.headsUp
  }
  private get rData(): RData {
    return this.doom.rData
  }
  private get rVideo(): RVideo {
    return this.doom.rVideo
  }
  private get sprites(): SpriteArray {
    return this.rData.sprites
  }
  private get spriteDefs(): SpriteDefsArray {
    return this.rData.spriteDefs
  }
  private get strings(): Strings {
    return this.doom.strings
  }
  private get wad(): LumpReader {
    return this.doom.wad
  }

  constructor(private doom: Doom) {
    this.textScreens = this.newTextScreens()
    this.castOrder = this.newCastOrder()
  }

  //
  // F_StartFinale
  //
  start(): void {
    this.game.gameAction = GameAction.Nothing
    this.game.gameState = GameState.Finale
    this.game.viewActive = false
    this.autoMap.active = false

    const gameMission = this.doom.instance.logicalMission

    if (gameMission === GameMission.Doom) {
      // S_StartMusic(mus_victor);
    } else {
      // S_StartMusic(mus_read_m);
    }

    // Find the right screen and set the text and background
    for (let i = 0; i < this.textScreens.length; ++i) {
      const s = this.textScreens[i]

      if (this.doom.instance.version === GameVersion.Chex &&
        s.mission === GameMission.Doom
      ) {
        s.level = 5
      }

      if (gameMission === s.mission &&
        (gameMission !== GameMission.Doom || this.game.gameEpisode === s.episode) &&
        this.game.gameMap === s.level
      ) {
        this.text = s.text
        this.flat = s.background
      }
    }

    this.stage = Stage.Text
    this.count = 0
  }

  responder(event: DEvent): boolean {
    if (this.stage === 2) {
      return this.castResponder(event)
    }
    return false
  }

  //
  // F_Ticker
  //
  ticker(): void {
    // check for skipping
    if (this.doom.instance.mode === GameMode.Commercial &&
      this.count > 50
    ) {
      let i: number
      // go on to the next level
      for (i = 0; i < MAX_PLAYERS; i++) {
        if (this.game.players[i].cmd.buttons) {
          break
        }
      }

      if (i < MAX_PLAYERS) {
        if (this.game.gameMap === 30) {
          this.startCast()
        } else {
          this.game.gameAction = GameAction.WorldDone
        }
      }
    }

    // advance animation
    this.count++

    if (this.stage === Stage.CharacterCast) {
      this.castTicker()
      return
    }

    if (this.doom.instance.mode === GameMode.Commercial) {
      return
    }

    if (this.stage === Stage.Text &&
      this.count > this.text.length * TEXT_SPEED + TEXT_WAIT
    ) {
      this.count = 0
      this.stage = Stage.ArtScreen
      // force a wipe
      this.doom.wipeGameState = -1
      if (this.game.gameEpisode === 3) {
        // S_StartMusic(mus_bunny);
      }
    }
  }

  //
  // F_TextWrite
  //
  private textWrite(): void {
    // erase the entire screen to a tiled background
    const src = new Uint8Array(this.wad.cacheLumpName(this.flat))
    const dest = this.rVideo.screens[0]
    let destPtr = 0
    for (let y = 0; y < SCREENHEIGHT; ++y) {
      for (let x = 0; x < SCREENWIDTH / 64; ++x) {
        dest.set(
          src.slice((y & 63) << 6, ((y & 63) << 6) + 64),
          destPtr,
        )
        destPtr += 64
      }
      if (SCREENWIDTH & 63) {
        dest.set(
          src.slice((y & 63) << 6, ((y & 63) << 6) + SCREENWIDTH & 63),
          destPtr,
        )
        destPtr += SCREENWIDTH & 63
      }
    }

    let count = (this.count - 10) / TEXT_SPEED
    if (count < 0) {
      count = 0
    }

    // draw some of the text onto the screen
    this.headsUp.lib.writeText(10, 10, this.text.substr(0, count), 11)
  }

  //
  // Final DOOM 2 animation
  // Casting by id Software.
  //   in order of appearance
  //
  private castOrder: [string, MObjType][]
  private newCastOrder(): [string, MObjType][] {
    return [
      [ this.strings.ccZombie, MObjType.Possessed ],
      [ this.strings.ccShotgun, MObjType.Shotguy ],
      [ this.strings.ccHeavy, MObjType.Chainguy ],
      [ this.strings.ccImp, MObjType.Troop ],
      [ this.strings.ccDemon, MObjType.Sergeant ],
      [ this.strings.ccLost, MObjType.Skull ],
      [ this.strings.ccCaco, MObjType.Head ],
      [ this.strings.ccHell, MObjType.Knight ],
      [ this.strings.ccBaron, MObjType.Bruiser ],
      [ this.strings.ccArach, MObjType.Baby ],
      [ this.strings.ccPain, MObjType.Pain ],
      [ this.strings.ccReven, MObjType.Undead ],
      [ this.strings.ccMancu, MObjType.Fatso ],
      [ this.strings.ccArch, MObjType.Vile ],
      [ this.strings.ccSpider, MObjType.Spider ],
      [ this.strings.ccCyber, MObjType.Cyborg ],
      [ this.strings.ccHero, MObjType.Player ],
    ]
  }

  private castNum = 0
  private castTics = 0
  private castState: State<unknown, [MObj]> | null = null
  private castDeath = false
  private castFrames = 0
  private castOnMelee = 0
  private castAttacking = false

  //
  // F_StartCast
  //
  private startCast() {
    // force a screen wipe
    this.doom.wipeGameState = -1
    this.castNum = 0
    const cast = this.castOrder[this.castNum][1]
    this.castState = states[mObjInfos[cast].seeState] as State<unknown, [MObj]>
    this.castTics = this.castState.tics
    this.castDeath = false
    this.stage = Stage.CharacterCast
    this.castFrames = 0
    this.castOnMelee = 0
    this.castAttacking = false
    // S_ChangeMusic(mus_evil, true);
  }

  //
  // F_CastTicker
  //
  private castTicker() {
    let mObjInfo: MObjInfo
    let st: StateNum
    let sfx: SfxName

    if (--this.castTics > 0 || this.castState === null) {
      // not time to change state yet
      return
    }

    if (this.castState.tics === -1 ||
      this.castState.nextState === StateNum.Null
    ) {
      // switch from deathstate to next monster
      this.castNum++
      this.castDeath = false
      if (this.castOrder[this.castNum] === undefined) {
        this.castNum = 0
      }

      mObjInfo = mObjInfos[this.castOrder[this.castNum][1]]

      if (mObjInfo.seeSound) {
        this.dSound.startSound(null, mObjInfo.seeSound)
      }

      this.castState = states[mObjInfo.seeState] as State<unknown, [MObj]>
      this.castFrames = 0
    } else {
      mObjInfo = mObjInfos[this.castOrder[this.castNum][1]]

      // just advance to next state in animation
      if (this.castState === states[StateNum.PlayAtk1]) {
        // Oh, gross hack!
        this.castTickerStopAttack(mObjInfo)
        this.castTickerFinalize(this.castState)
      }
      st = this.castState.nextState
      this.castState = states[st] as State<unknown, [MObj]>
      this.castFrames++

      // sound hacks....
      switch (st) {
      case StateNum.PlayAtk1: sfx = SfxName.Dshtgn; break
      case StateNum.PossAtk2: sfx = SfxName.Pistol; break
      case StateNum.SposAtk2: sfx = SfxName.Shotgn; break
      case StateNum.VileAtk2: sfx = SfxName.Vilatk; break
      case StateNum.SkelFist2: sfx = SfxName.Skeswg; break
      case StateNum.SkelFist4: sfx = SfxName.Skepch; break
      case StateNum.SkelMiss2: sfx = SfxName.Skeatk; break
      case StateNum.FattAtk8:
      case StateNum.FattAtk5:
      case StateNum.FattAtk2: sfx = SfxName.Firsht; break
      case StateNum.CposAtk2:
      case StateNum.CposAtk3:
      case StateNum.CposAtk4: sfx = SfxName.Shotgn; break
      case StateNum.TrooAtk3: sfx = SfxName.Claw; break
      case StateNum.SargAtk2: sfx = SfxName.Sgtatk; break
      case StateNum.BossAtk2:
      case StateNum.Bos2Atk2:
      case StateNum.HeadAtk2: sfx = SfxName.Firsht; break
      case StateNum.SkullAtk2: sfx = SfxName.Sklatk; break
      case StateNum.SpidAtk2:
      case StateNum.SpidAtk3: sfx = SfxName.Shotgn; break
      case StateNum.BspiAtk2: sfx = SfxName.Plasma; break
      case StateNum.CyberAtk2:
      case StateNum.CyberAtk4:
      case StateNum.CyberAtk6: sfx = SfxName.Rlaunc; break
      case StateNum.PainAtk3: sfx = SfxName.Sklatk; break
      default: sfx = 0; break
      }

      if (sfx) {
        this.dSound.startSound(null, sfx)
      }
    }

    if (this.castFrames === 12) {
      // go into attack frame
      this.castAttacking = true
      if (this.castOnMelee) {
        this.castState = states[mObjInfo.meleeState] as State<unknown, [MObj]>
      } else {
        this.castState = states[mObjInfo.missileState] as State<unknown, [MObj]>
      }
      this.castOnMelee ^= 1
      if (this.castState === states[StateNum.Null]) {
        if (this.castOnMelee) {
          this.castState = states[mObjInfo.meleeState] as State<unknown, [MObj]>
        } else {
          this.castState = states[mObjInfo.missileState] as State<unknown, [MObj]>
        }
      }
    }

    if (this.castAttacking) {
      if (this.castFrames === 24 ||
        this.castState === states[mObjInfo.seeState] as State<unknown, [MObj]>
      ) {
        this.castTickerStopAttack(mObjInfo)
      }
    }

    this.castTickerFinalize(this.castState)
  }
  private castTickerStopAttack(mObjInfo: MObjInfo): void {
    this.castAttacking = false
    this.castFrames = 0
    this.castState = states[mObjInfo.seeState] as State<unknown, [MObj]>
  }
  private castTickerFinalize(state: State<unknown, [MObj]>): void {
    this.castTics = state.tics
    if (this.castTics === -1) {
      this.castTics = 15
    }
  }

  private castResponder(ev: DEvent): boolean {
    if (ev.type !== EvType.KeyDown) {
      return false
    }

    if (this.castDeath) {
      // already in dying frames
      return true
    }

    // go into death frame
    this.castDeath = true
    const mObjInfo = mObjInfos[this.castOrder[this.castNum][1]]
    this.castState = states[mObjInfo.deathState] as State<unknown, [MObj]>
    this.castTics = this.castState.tics
    this.castFrames = 0
    this.castAttacking = false
    if (mObjInfo.deathSound) {
      this.dSound.startSound(null, mObjInfo.deathSound)
    }
    return true
  }

  private castPrint(text: string): void {
    const width = this.headsUp.lib.stringWidth(text)
    this.headsUp.lib.writeText(160 - (width / 2 >> 0), 180, text)
  }
  private castDrawer() {
    // erase the entire screen to a background
    this.rVideo.drawPatch(0, 0, 0, this.wad.cacheLumpName('BOSSBACK', Patch))

    this.castPrint(this.castOrder[this.castNum][0])

    if (this.castState === null) {
      throw 'this.castState = null'
    }

    // draw the current frame in the middle of the screen
    const sprDef = this.spriteDefs[this.castState.sprite]
    const sprFrame = sprDef.frames[this.castState.frame & FF_FRAMEMASK]
    const lump = sprFrame.lump[0]
    const flip = !!sprFrame.flip[0]

    const patch = this.sprites[lump].patch
    this.rVideo.drawPatch(160, 170, 0, patch, { flipped: flip })
  }

  //
  // F_DrawPatchCol
  //
  private drawPatchCol(x: number, patch: Patch, col: number): void {
    const column = patch.columns[col]
    const screen = this.rVideo.screens[0]
    const destTopPtr = x

    let post: Post
    let sourcePtr = 0
    let destPtr = 0
    let count = 0
    // step through the posts in a column
    for (post of column.posts) {
      sourcePtr = 0
      destPtr = destTopPtr + post.topDelta * SCREENWIDTH
      count = post.length

      while (count--) {
        screen[destPtr] = post.bytes[sourcePtr++]
        destPtr += SCREENWIDTH
      }
    }
  }

  //
  // F_BunnyScroll
  //
  private lastStage = 0
  private bunnyScroll() {
    const p1 = this.wad.cacheLumpName('PFUB2', Patch)
    const p2 = this.wad.cacheLumpName('PFUB1', Patch)


    let scrolled = 320 - ((this.count - 230) / 2 >> 0)
    if (scrolled > 320) {
      scrolled = 320
    }
    if (scrolled < 0) {
      scrolled = 0
    }

    for (let x = 0; x < SCREENWIDTH; x++) {
      if (x + scrolled < 320) {
        this.drawPatchCol(x, p1, x + scrolled)
      } else {
        this.drawPatchCol(x, p2, x + scrolled - 320)
      }
    }


    if (this.count < 1130) {
      return
    }
    if (this.count < 1180) {
      this.rVideo.drawPatch(
        (SCREENWIDTH - 13 * 8) / 2, (SCREENHEIGHT - 8 * 8) / 2, 0,
        this.wad.cacheLumpName('END0', Patch))
      this.lastStage = 0
      return
    }

    let stage = (this.count - 1180) / 5 >> 0
    if (stage > 6) {
      stage = 6
    }
    if (stage > this.lastStage) {
      this.dSound.startSound(null, SfxName.Pistol)
      this.lastStage = stage
    }

    this.rVideo.drawPatch(
      (SCREENWIDTH - 13 * 8) / 2, (SCREENHEIGHT - 8 * 8) / 2, 0,
      this.wad.cacheLumpName(`END${stage}`, Patch))
  }

  //
  // F_Drawer
  //
  drawer(): void {
    if (this.stage === Stage.CharacterCast) {
      this.castDrawer()
      return
    }

    if (this.stage === Stage.Text) {
      this.textWrite()
    } else {
      switch (this.game.gameEpisode) {
      case 1:
        this.rVideo.drawPatch(0, 0, 0,
          this.wad.cacheLumpName(this.doom.instance.creditPatch, Patch))
        break
      case 2:
        this.rVideo.drawPatch(0, 0, 0,
          this.wad.cacheLumpName('VICTORY2', Patch))
        break
      case 3:
        this.bunnyScroll()
        break
      case 4:
        this.rVideo.drawPatch(0, 0, 0,
          this.wad.cacheLumpName('ENDPIC', Patch))
        break
      }
    }
  }
}
