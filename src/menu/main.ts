import { AbstractReadThisMenu, ReadThis1Menu, ReadThis2Menu } from './read-this'
import { GameMode, GameVersion, Language } from '../doom/mode'
import { LoadGameMenu, SaveGameMenu } from './save-game'
import { MenuItem, MenuStruct } from './typedefs'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom/doom'
import { EpisodeMenu } from './episode'
import { Game } from '../game/game'
import { GameState } from '../global/doomdef'
import { Menu } from './menu'
import { NewGameMenu } from './new-game'
import { OptionsMenu } from './options'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'
import { Sfx } from '../doom/sounds/sfx'
import { Strings } from '../translation/strings'
import { Wad } from '../wad/wad'

//
// M_QuitDOOM
//
const quitSounds: readonly Sfx[] = [
  Sfx.Pldeth,
  Sfx.Dmpain,
  Sfx.Popain,
  Sfx.Slop,
  Sfx.Telept,
  Sfx.Posit1,
  Sfx.Posit3,
  Sfx.Sgtatk,
]

const quitSounds2: readonly Sfx[] = [
  Sfx.Vilact,
  Sfx.Getpow,
  Sfx.Boscub,
  Sfx.Slop,
  Sfx.Skeswg,
  Sfx.Kntdth,
  Sfx.Bspact,
  Sfx.Sgtatk,
]

export const enum MainEnum {
  NewGame,
  Options,
  LoadGame,
  SaveGame,
  ReadThis,
  QuitDoom,
  MainEnd,
}

export class MainMenu implements MenuStruct {
  numItems = MainEnum.MainEnd

  prevMenu = null

  menuItems: MenuItem[] = [
    {
      status: 1,
      name: 'M_NGAME',
      routine: this.newGame,
      alphaKey: 'n',
    },
    {
      status: 1,
      name: 'M_OPTION',
      routine: this.options,
      alphaKey: 'o',
    },
    {
      status: 1,
      name: 'M_LOADG',
      routine: this.loadGame,
      alphaKey: 'l',
    },
    {
      status: 1,
      name: 'M_SAVEG',
      routine: this.saveGame,
      alphaKey: 's',
    },
    // Another hickup with Special edition.
    {
      status: 1,
      name: 'M_RDTHIS',
      routine: this.readThis,
      alphaKey: 'r',
    },
    {
      status: 1,
      name: 'M_QUITG',
      routine: this.quitDOOM,
      alphaKey: 'q',
    },
  ]

  x = 97
  y = 64
  lastOn = 0

  episodeMenu = new EpisodeMenu(this)
  newGameMenu = new NewGameMenu(this)
  optionsMenu = new OptionsMenu(this)
  loadMenu = new LoadGameMenu(this)
  saveMenu = new SaveGameMenu(this)

  readThis1Menu: AbstractReadThisMenu = new ReadThis1Menu(this)
  readThis2Menu: AbstractReadThisMenu = new ReadThis2Menu(this)

  public get doom(): Doom {
    return this.menu.doom
  }
  public get dSound(): DSound {
    return this.menu.dSound
  }
  public get game(): Game {
    return this.menu.game
  }
  public get rVideo(): RVideo {
    return this.menu.rVideo
  }
  public get strings(): Strings {
    return this.menu.strings
  }
  public get wad(): Wad {
    return this.menu.wad
  }

  constructor(public menu: Menu) {
    this.readThis1Menu.prevMenu = this
    this.readThis1Menu.nextMenu = this.readThis2Menu
    this.readThis2Menu.prevMenu = this.readThis1Menu
    this.readThis2Menu.nextMenu = this
  }

  //
  // Selected from DOOM menu
  //
  loadGame(): void {
    this.menu.setupNextMenu(this.loadMenu)
    this.loadMenu.readSaveStrings()
  }

  //
  // Selected from DOOM menu
  //
  saveGame(): void {
    if (!this.game.userGame) {
      this.menu.startMessage(this.strings.savedead, false)
      return
    }

    if (this.game.gameState !== GameState.Level) {
      return
    }

    this.menu.setupNextMenu(this.saveMenu)
    this.saveMenu.readSaveStrings()
  }

  //
  // M_DrawMainMenu
  //
  routine(): void {
    this.rVideo.drawPatchDirect(
      94, 2, 0,
      this.wad.cacheLumpName('M_DOOM', Patch),
    )
  }

  //
  // M_NewGame
  //
  private newGame(): void {
    if (this.doom.gameMode === GameMode.Commercial ||
      this.doom.gameVersion === GameVersion.Chex) {
      this.menu.setupNextMenu(this.episodeMenu.newGameMenu)
    } else {
      this.menu.setupNextMenu(this.episodeMenu)
    }
  }

  private options(): void {
    this.menu.setupNextMenu(this.optionsMenu)
  }

  //
  // M_ReadThis
  //
  private readThis(): void {
    if (this.doom.gameVersion >= GameVersion.Ultimate) {
      this.menu.setupNextMenu(this.readThis2Menu)
    } else {
      this.menu.setupNextMenu(this.readThis1Menu)
    }
  }

  private quitResponse(ch: number): void {
    if (ch !== 'y'.charCodeAt(0)) {
      return
    }
    if (!this.game.netGame) {
      if (this.doom.gameMode === GameMode.Commercial) {
        this.dSound.startSound(null,
          quitSounds2[this.game.gameTic >> 2 & 7])
      } else {
        this.dSound.startSound(null,
          quitSounds[this.game.gameTic >> 2 & 7])
      }
    }
    // TODO
  }

  quitDOOM(): void {
    let endString: string
    // We pick index 0 which is language sensitive,
    //  or one at random, between 1 and maximum number.
    if (this.doom.language !== Language.English) {
      endString = `${this.doom.strings.endmsg[0]}\n\n` + this.doom.strings.dosy
    } else {
      const idx = this.game.gameTic % (this.doom.strings.numQuitMessages - 2) + 1
      endString = `${this.doom.strings.endmsg[idx]}\n\n` + this.doom.strings.dosy
    }
    this.menu.startMessage(endString, true, this.quitResponse)
  }
}
