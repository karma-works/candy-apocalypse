import { AbstractReadThisMenu, ReadThis1Menu, ReadThis2Menu } from './read-this'
import { GameMode, GameVersion, Language } from '../doom/mode'
import { GameState, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { LoadGameMenu, SaveGameMenu } from './save-game'
import { MenuItem, MenuStruct } from './typedefs'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom'
import { EpisodeMenu } from './episode'
import { Game } from '../game/game'
import { LumpReader } from '../wad/lump-reader'
import { Menu } from './menu'
import { NewGameMenu } from './new-game'
import { OptionsMenu } from './options'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'
import { ScanCode } from '../interfaces/scancodes'
import { SfxName } from '../doom/sounds/sfx-name'
import { Strings } from '../translation/strings'

//
// M_QuitDOOM
//
const quitSounds: readonly SfxName[] = [
  SfxName.Pldeth,
  SfxName.Dmpain,
  SfxName.Popain,
  SfxName.Slop,
  SfxName.Telept,
  SfxName.Posit1,
  SfxName.Posit3,
  SfxName.Sgtatk,
]

const quitSounds2: readonly SfxName[] = [
  SfxName.Vilact,
  SfxName.Getpow,
  SfxName.Boscub,
  SfxName.Slop,
  SfxName.Skeswg,
  SfxName.Kntdth,
  SfxName.Bspact,
  SfxName.Sgtatk,
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
  public get wad(): LumpReader {
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
    const scale = this.rVideo.scale
    const offsetX = (this.rVideo.width - SCREENWIDTH * scale) / 2
    const offsetY = (this.rVideo.height - SCREENHEIGHT * scale) / 2
    this.rVideo.drawPatch(
      94 * scale + offsetX, 2 * scale + offsetY, 0,
      this.wad.cacheLumpName('M_DOOM', Patch),
    )
  }

  //
  // M_NewGame
  //
  private newGame(): void {
    if (this.doom.gameMode === GameMode.Commercial ||
      this.doom.gameVersion === GameVersion.Chex) {
      this.menu.setupNextMenu(this.newGameMenu)
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
    if (ch !== ScanCode.KeyY) {
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
    this.doom.quit()
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
