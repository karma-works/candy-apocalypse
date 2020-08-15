import { Game, SAVE_GAME_NAME, SAVE_STRING_SIZE } from '../game/game'
import { GameState, KEY_BACKSPACE, KEY_ENTER, KEY_ESCAPE } from '../global/doomdef'
import { HU_FONTSIZE, HU_FONTSTART } from '../heads-up/stuff'
import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { tostring, toupper } from '../utils/c'
import { Sound as DSound } from '../doom/sound'
import { LumpReader } from '../wad/lump-reader'
import { MainMenu } from './main'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'
import { SfxName } from '../doom/sounds/sfx-name'
import { Strings } from '../translation/strings'
import { fs } from '../system/fs'

export const enum Save {
  Save1,
  Save2,
  Save3,
  Save4,
  Save5,
  Save6,
  SaveEnd,
}
export class LoadGameMenu implements MenuStruct {
  numItems = Save.SaveEnd

  menuItems: MenuItem[] = [
    {
      status: 1,
      routine: this.select,
      alphaKey: '1',
    },
    {
      status: 1,
      routine: this.select,
      alphaKey: '2',
    },
    {
      status: 1,
      routine: this.select,
      alphaKey: '3',
    },
    {
      status: 1,
      routine: this.select,
      alphaKey: '4',
    },
    {
      status: 1,
      routine: this.select,
      alphaKey: '5',
    },
    {
      status: 1,
      routine: this.select,
      alphaKey: '6',
    },
  ]

  x = 80
  y = 54
  lastOn = 0

  protected get dSound(): DSound {
    return this.prevMenu.dSound
  }
  protected get game(): Game {
    return this.prevMenu.game
  }
  protected get menu(): Menu {
    return this.prevMenu.menu
  }
  private get rVideo(): RVideo {
    return this.prevMenu.rVideo
  }
  protected get strings(): Strings {
    return this.prevMenu.strings
  }
  private get wad(): LumpReader {
    return this.prevMenu.wad
  }

  constructor(public prevMenu: MainMenu) { }

  //
  // M_LoadGame & Cie.
  //
  protected title = 'M_LOADG'
  routine(): void {
    this.rVideo.drawPatch(
      72, 28, 0,
      this.wad.cacheLumpName(this.title, Patch),
    )

    for (let i = 0; i < Save.SaveEnd; ++i) {
      this.drawSaveLoadBorder(this.x, this.y + LINEHEIGHT * i)
      this.menu.writeText(
        this.x,
        this.y + LINEHEIGHT * i,
        this.saveGameStrings[i],
      )
    }
  }

  //
  // User wants to load this game
  //
  protected select(choice: number): void {
    this.game.loadGame(`${SAVE_GAME_NAME}${choice}.dsg`)
    this.menu.clearMenus()
  }

  //
  // M_QuickLoad
  //
  private quickLoadResponse(choice: number): void {
    if (choice === 'y'.charCodeAt(0)) {
      this.select(this.menu.quickSaveSlot)
      this.dSound.startSound(null, SfxName.Swtchx)
    }
  }

  quickLoad(): void {
    if (this.menu.quickSaveSlot < 0) {
      this.menu.startMessage(this.strings.qsavespot, false)
      return
    }
    this.menu.startMessage(
      this.strings.qlprompt(this.saveGameStrings[this.menu.quickSaveSlot]),
      true,
      this.quickLoadResponse,
    )
  }

  //
  // M_ReadSaveStrings
  //  read the strings from the savegame files
  //
  protected saveGameStrings: string[] = new Array(10).fill('')
  async readSaveStrings(): Promise<void> {
    const promises: Promise<void>[] = []
    for (let i = 0; i < Save.SaveEnd; ++i) {
      promises.push(this.readSaveString(i))
    }
    await Promise.all(promises)
  }
  protected async readSaveString(i: number): Promise<void> {
    this.saveGameStrings[i] = '...'
    this.menuItems[i].status = 0

    const handle = await fs.open(`${SAVE_GAME_NAME}${i}.dsg`)

    if (handle === undefined) {
      this.saveGameStrings[i] = ''
      return
    }

    this.saveGameStrings[i] = tostring(handle, 0, SAVE_STRING_SIZE)
    this.menuItems[i].status = 1
  }

  //
  // Draw border for the savegame description
  //
  private drawSaveLoadBorder(x: number, y: number): void {
    this.rVideo.drawPatch(
      x - 8, y + 7, 0,
      this.wad.cacheLumpName('M_LSLEFT', Patch),
    )
    for (let i = 0; i < 24; ++i) {
      this.rVideo.drawPatch(
        x, y + 7, 0,
        this.wad.cacheLumpName('M_LSCNTR', Patch),
      )
      x += 8
    }
    this.rVideo.drawPatch(
      x, y + 7, 0,
      this.wad.cacheLumpName('M_LSRGHT', Patch),
    )
  }
}

export class SaveGameMenu extends LoadGameMenu {
  protected title = 'M_SAVEG'
  routine(): void {
    super.routine()

    if (this.saveStringEnter) {
      const i = this.menu.stringWidth(this.saveGameStrings[this.saveSlot])
      this.menu.writeText(
        this.x + i,
        this.y + LINEHEIGHT * this.saveSlot,
        '_',
      )
    }
  }

  //
  // M_Responder calls this when user is finished
  //
  private doSave(slot: number): void {
    this.game.setSaveGame(slot, this.saveGameStrings[slot])
    this.menu.clearMenus()

    // PICK QUICKSAVE SLOT YET?
    if (this.menu.quickSaveSlot === -2) {
      this.menu.quickSaveSlot = slot
    }
  }

  //
  // User wants to save. Start string input for M_Responder
  //
  protected select(choice: number): void {
    // we are going to be intercepting all chars
    this.saveStringEnter = true

    this.saveSlot = choice
    this.saveOldString = this.saveGameStrings[choice]
    this.saveCharIndex = this.saveGameStrings[choice].length
  }

  //
  //      M_QuickSave
  //
  private quickSaveResponse(ch: number): void {
    if (ch === 'y'.charCodeAt(0)) {
      this.doSave(this.menu.quickSaveSlot)
      this.dSound.startSound(null, SfxName.Swtchx)
    }
  }

  quickSave(): void {
    if (!this.game.userGame) {
      this.dSound.startSound(null, SfxName.Oof)
      return
    }
    if (this.game.gameState !== GameState.Level) {
      return
    }

    if (this.menu.quickSaveSlot < 0) {
      this.menu.startControlPanel()
      this.readSaveStrings()
      this.menu.setupNextMenu(this)
      // means to pick a slot now
      this.menu.quickSaveSlot = -2
      return
    }
    this.menu.startMessage(
      this.strings.qsprompt(this.saveGameStrings[this.menu.quickSaveSlot]),
      true,
      this.quickSaveResponse,
    )
  }

  // we are going to be entering a savegame string
  private saveStringEnter = false
  // which slot to save in
  private saveSlot = 0
  // which char we're editing
  private saveCharIndex = 0
  // old save description before edit
  private saveOldString = ''

  responder(ch: number): boolean {
    if (this.saveStringEnter) {
      switch (ch) {
      case KEY_BACKSPACE:
        if (this.saveCharIndex > 0) {
          this.saveCharIndex--
          this.saveGameStrings[this.saveSlot] =
              this.saveGameStrings[this.saveSlot].substr(0, this.saveCharIndex)
        }
        break

      case KEY_ESCAPE:
        this.saveStringEnter = false
        this.saveGameStrings[this.saveSlot] = this.saveOldString
        break

      case KEY_ENTER:
        this.saveStringEnter = false
        if (this.saveGameStrings[this.saveSlot].length > 0) {
          this.doSave(this.saveSlot)
        }
        break

      default:
        ch = toupper(ch)
        if (ch !== 32) {
          if (ch - HU_FONTSTART < 0 ||
              ch - HU_FONTSTART >= HU_FONTSIZE) {
            break
          }
        }
        if (ch >= 32 && ch <= 127 &&
          this.saveCharIndex < SAVE_STRING_SIZE - 1 &&
          this.menu.stringWidth(this.saveGameStrings[this.saveSlot]) < (SAVE_STRING_SIZE - 2) * 8
        ) {
          this.saveGameStrings[this.saveSlot] =
              this.saveGameStrings[this.saveSlot].substr(0, this.saveCharIndex) +
              String.fromCharCode(ch)
          this.saveCharIndex++
        }
        break
      }
      return true
    }

    return false
  }

  protected async readSaveString(i: number): Promise<void> {
    await super.readSaveString(i)
    this.menuItems[i].status = 1
  }
}
