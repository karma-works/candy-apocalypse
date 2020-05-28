import { EvType, Event } from '../doom/event'
import { GameMode, KEY_BACKSPACE, KEY_DOWNARROW, KEY_ENTER, KEY_EQUALS, KEY_ESCAPE, KEY_F1, KEY_F10, KEY_F11, KEY_F2, KEY_F3, KEY_F4, KEY_F5, KEY_F6, KEY_F7, KEY_F8, KEY_F9, KEY_LEFTARROW, KEY_MINUS, KEY_RIGHTARROW, KEY_UPARROW, SCREENWIDTH } from '../global/doomdef'
import { HU_FONTSIZE, HU_FONTSTART, HeadsUp } from '../heads-up/stuff'
import { MainEnum, loadGame, mainDef, mainMenu, quitDOOM, saveGame } from './doom-menu'
import { Sound, soundDef } from './sound-volume'
import { changeDetail, changeMessages, endGame, sizeDisplay } from './options'
import { doSave, quickSave } from './save-game'
import { drawReadThis1, finishReadThis, readDef1, readDef2, readMenu1 } from './read-this'
import { Doom } from '../doom/doom'
import { Video as IVideo } from '../interfaces/video'
import { MenuStruct } from './typedefs'
import { Video as RVideo } from '../rendering/video'
import { Wad } from '../wad/wad'
import { episodeDef as epiDef } from './episode-select'
import { getTime } from '../system/system'
import { newDef } from './new-game'
import { quickLoad } from './load-game'
import { toupper } from '../c'

const SAVESTRINGSIZE = 24
const SKULLOFF = -32
const LINEHEIGHT = 16

export class Menu {

  // 1 = message to be printed
  private messageToPrint = false
  // ...and here is the message string!
  private messageString: string | null = null

  private messageLastMenuActive = false

  // timed message = no input from user
  messageNeedsInput = false
  messageRoutine?: (menu: Menu, response: number) => void

  // we are going to be entering a savegame string
  private saveStringEnter = 0
  // which slot to save in
  private saveSlot = 0
  // which char we're editing
  private saveCharIndex = 0
  // old save description before edit
  private saveOldString = ''

  private inHelpScreens = false
  private menuActive = false

  private saveGameStrings: string[] = new Array(10).fill('')

  // menu item skull is on
  private itemOn = 0
  // skull animation counter
  private skullAnimCounter = 0
  // which skull to draw
  private whichSkull = 0

  // graphic name of skulls
  // warning: initializer-string for array of chars is too long
  private skullName = [ 'M_SKULL1', 'M_SKULL2' ]

  // current menudef
  private currentMenu: MenuStruct = mainDef

  private quickSaveSlot = 0

  constructor(private doom: Doom,
              private headsUp: HeadsUp,
              private ivideo: IVideo,
              private rvideo: RVideo,
              private wad: Wad) {}

  //
  // Find string width from hu_font chars
  //
  stringWidth(str: string): number {
    let w = 0
    let c: number
    for (let i = 0; i < str.length; ++i) {
      c = toupper(str.charCodeAt(i)) - HU_FONTSTART
      if (c < 0 || c >= HU_FONTSIZE) {
        w += 4
      } else {
        w += this.headsUp.font[i].width
      }
    }

    return w
  }

  //
  // Find string height from hu_font chars
  //
  stringHeight(str: string): number {
    let h = 0
    const height = this.headsUp.font[0].height
    for (let i = 0; i < str.length; ++i) {
      if (str.charAt(i) === '\n') {
        h += height
      }
    }
    return h
  }

  //
  // Write a string using the hu_font
  //
  writeText(x: number, y: number, str: string): void {
    let w: number
    let ch = 0
    let c: number

    let cx = x
    let cy = y

    for (;;) {
      c = str.charCodeAt(ch++)
      if (!c) {
        break
      }
      if (c === '\n'.charCodeAt(0)) {
        cx = x
        cy += 12
        continue
      }

      c = toupper(c) - HU_FONTSTART
      if (c < 0 || c >= HU_FONTSIZE) {
        cx += 4
        continue
      }

      w = this.headsUp.font[c].width
      if (cx +w > SCREENWIDTH) {
        break
      }

      this.rvideo.drawPatchDirect(cx, cy, 0, this.headsUp.font[c])

      cx += w
    }
  }

  private joywait = 0
  private mousewait = 0
  private mousey = 0
  private lasty = 0
  private mousex = 0
  private lastx = 0

  async responder(ev: Event): Promise<boolean> {
    let ch = -1

    if (ev.type === EvType.Joystick && this.joywait < getTime()) {
      if (ev.data3 === -1) {
        ch = KEY_UPARROW
        this.joywait = getTime() + 5
      } else if (ev.data3 === 1) {
        ch = KEY_DOWNARROW
        this.joywait = getTime() + 5
      }

      if (ev.data2 === -1) {
        ch = KEY_LEFTARROW
        this.joywait = getTime() + 2
      } else if (ev.data2 === 1) {
        ch = KEY_RIGHTARROW
        this.joywait = getTime() + 2
      }

      if (ev.data1 & 1) {
        ch = KEY_ENTER
        this.joywait = getTime() + 5
      }
      if (ev.data1 & 2) {
        ch = KEY_BACKSPACE
        this.joywait = getTime() + 5
      }
    } else {
      if (ev.type === EvType.Mouse && this.mousewait < getTime()) {
        this.mousey += ev.data3
        if (this.mousey < this.lasty - 30) {
          ch = KEY_DOWNARROW
          this.mousewait = getTime() + 5
          this.mousey = this.lasty -= 30
        } else if (this.mousey > this.lasty + 30) {
          ch = KEY_UPARROW
          this.mousewait = getTime() + 5
          this.mousey = this.lasty += 30
        }

        this.mousex += ev.data2
        if (this.mousex < this.lastx - 30) {
          ch = KEY_LEFTARROW
          this.mousewait = getTime() + 5
          this.mousex = this.lastx -= 30
        } else if (this.mousex > this.lastx + 30) {
          ch = KEY_RIGHTARROW
          this.mousewait = getTime() + 5
          this.mousex = this.lastx += 30
        }

        if (ev.data1 & 1) {
          ch = KEY_ENTER
          this.mousewait = getTime() + 15
        }
        if (ev.data1 & 2) {
          ch = KEY_BACKSPACE
          this.mousewait = getTime() + 15
        }
      } else {
        if (ev.type === EvType.KeyDown) {
          ch = ev.data1
        }
      }
    }

    if (ch === -1) {
      return false
    }

    // Save Game string input
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
        this.saveStringEnter = 0
        this.saveGameStrings[this.saveSlot] = this.saveOldString
        break

      case KEY_ENTER:
        this.saveStringEnter = 0
        if (this.saveGameStrings[this.saveSlot].length > 0) {
          doSave(this, this.saveSlot)
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
          this.saveCharIndex < SAVESTRINGSIZE - 1 &&
          this.stringWidth(this.saveGameStrings[this.saveSlot]) < (SAVESTRINGSIZE - 2) * 8
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

    if (this.messageToPrint) {
      if (this.messageNeedsInput &&
        !(ch === ' '.charCodeAt(0) ||
          ch === 'n'.charCodeAt(0) ||
          ch === 'y'.charCodeAt(0) ||
          ch === KEY_ESCAPE)) {
        return false
      }

      this.menuActive = this.messageLastMenuActive
      this.messageToPrint = false
      if (this.messageRoutine) {
        this.messageRoutine(this, ch)
      }

      this.menuActive = false
      return true
    }

    if (!this.menuActive) {
      switch (ch) {
      // Screen size down
      case KEY_MINUS:
        sizeDisplay(this, 0)
        return true

      // Screen size up
      case KEY_EQUALS:
        sizeDisplay(this, 1)
        return true

      // Help key
      case KEY_F1:
        this.startControlPanel()

        if (this.doom.gameMode === GameMode.Retail) {
          this.currentMenu = readDef2
        } else {
          this.currentMenu = readDef1
        }

        this.itemOn = 0
        return true

      // Save
      case KEY_F2:
        this.startControlPanel()
        saveGame(this, 0)
        return true

      // Load
      case KEY_F3:
        this.startControlPanel()
        loadGame(this, 0)
        return true

      // Sound Volume
      case KEY_F4:
        this.startControlPanel()
        this.currentMenu = soundDef
        this.itemOn = Sound.SfxVol
        return true

      // Detail toggle
      case KEY_F5:
        changeDetail(this, 0)
        return true

      // Quicksave
      case KEY_F6:
        quickSave(this)
        return true

      // End game
      case KEY_F7:
        endGame(this, 0)
        return true

      // Toggle messages
      case KEY_F8:
        changeMessages(this, 0)
        return true

      // Quickload
      case KEY_F9:
        quickLoad(this)
        return true

      // Quit DOOM
      case KEY_F10:
        quitDOOM(this, 0)
        return true

      // gamma toggle
      case KEY_F11:
        this.ivideo.useGamma++
        if (this.ivideo.useGamma > 4) {
          this.ivideo.useGamma = 4
        }
        this.ivideo.setPalette(await this.wad.cacheLumpName('PLAYPAL'))
        return true
      }
    }

    // Pop-up menu?
    if (!this.menuActive) {
      if (ch === KEY_ESCAPE) {
        this.startControlPanel()
        return true
      }
      return false
    }

    // Keys usable within menu
    switch (ch) {
    case KEY_DOWNARROW:
      do {
        if (this.itemOn + 1 > this.currentMenu.numItems - 1) {
          this.itemOn = 0
        } else {
          this.itemOn++
        }
      } while (this.currentMenu.menuItems[this.itemOn].status === -1)
      return true

    case KEY_UPARROW:
      do {
        if (!this.itemOn) {
          this.itemOn = this.currentMenu.numItems - 1
        } else {
          this.itemOn--
        }
      } while (this.currentMenu.menuItems[this.itemOn].status === -1)
      return true

    case KEY_LEFTARROW: {
      const item = this.currentMenu.menuItems[this.itemOn]
      if (item.routine && item.status === 2) {
        item.routine(this, 0)
      }
      return true
    }

    case KEY_RIGHTARROW: {
      const item = this.currentMenu.menuItems[this.itemOn]
      if (item.routine && item.status === 2) {
        item.routine(this, 1)
      }
      return true
    }

    case KEY_ENTER: {
      const item = this.currentMenu.menuItems[this.itemOn]
      if (item.routine && item.status) {
        this.currentMenu.lastOn = this.itemOn
        if (item.status === 2) {
          // right arrow
          item.routine(this, 1)
        } else {
          item.routine(this, this.itemOn)
        }
      }
      return true
    }

    case KEY_ESCAPE:
      this.currentMenu.lastOn = this.itemOn
      this.clearMenus()
      return true

    case KEY_BACKSPACE:
      this.currentMenu.lastOn = this.itemOn
      if (this.currentMenu.prevMenu) {
        this.currentMenu = this.currentMenu.prevMenu
        this.itemOn = this.currentMenu.lastOn
      }
      return true

    default:
      for (let i = this.itemOn + 1; i < this.currentMenu.numItems; ++i) {
        if (this.currentMenu.menuItems[i].alphaKey === String.fromCharCode(ch)) {
          this.itemOn = i
          return true
        }
      }
      for (let i = 0; i <= this.itemOn; ++i) {
        if (this.currentMenu.menuItems[i].alphaKey === String.fromCharCode(ch)) {
          this.itemOn = i
          return true
        }
      }
      break
    }

    return false
  }

  //
  // M_StartControlPanel
  //
  startControlPanel(): void {
    // intro might call this repeatedly
    if (this.menuActive) {
      return
    }

    this.menuActive = true
    this.currentMenu = mainDef
    this.itemOn = this.currentMenu.lastOn
  }

  //
  // M_Drawer
  // Called after the view has been rendered,
  // but before it has been blitted.
  //
  private x = 0
  private y = 0
  async drawer(): Promise<void> {
    this.inHelpScreens = false

    // Horiz. & Vertically center string and print it.
    if (this.messageToPrint && this.messageString !== null) {
      let start = 0
      let i = 0
      this.y = 100 - Math.floor(this.stringHeight(this.messageString) / 2)
      let str = ''

      while (this.messageString.charAt(start)) {
        for (i = 0; i < this.messageString.substr(start).length; ++i) {
          if (this.messageString.charAt(start + i) === '\n') {
            str = this.messageString.substr(start, i)
            start += i + 1
            break
          }
        }

        if (i === this.messageString.substr(start).length) {
          str = this.messageString.substr(start)
          start += i
        }

        this.x = 160 - Math.floor(this.stringWidth(str) / 2)
        this.writeText(this.x, this.y, str)
        this.y += this.headsUp.font[0].height
      }

      return
    }

    if (!this.menuActive) {
      return
    }

    if (this.currentMenu.routine) {
      // call Draw routine
      this.currentMenu.routine(this)
    }

    // DRAW MENU
    this.x = this.currentMenu.x
    this.y = this.currentMenu.y
    const max = this.currentMenu.numItems

    for (let i = 0; i < max; ++i) {
      if (this.currentMenu.menuItems[i].name) {
        this.rvideo.drawPatchDirect(
          this.x, this.y, 0,
          await this.wad.cacheLumpName(this.currentMenu.menuItems[i].name),
        )
      }
      this.y += LINEHEIGHT
    }

    this.rvideo.drawPatchDirect(
      this.x + SKULLOFF,
      this.currentMenu.y - 5 + this.itemOn * LINEHEIGHT,
      0,
      await this.wad.cacheLumpName(this.skullName[this.whichSkull]),
    )

  }

  //
  // M_ClearMenus
  //
  clearMenus(): void {
    this.menuActive = false
  }

  init(): void {
    this.currentMenu = mainDef
    this.menuActive = false
    this.itemOn = this.currentMenu.lastOn
    this.whichSkull = 0
    this.skullAnimCounter = 10
    this.messageToPrint = false
    this.messageString = null
    this.messageLastMenuActive = this.menuActive
    this.quickSaveSlot = -1


    // Here we could catch other version dependencies,
    //  like HELP1/2, and four episodes.

    switch (this.doom.gameMode) {
    case GameMode.Commercial:
      // This is used because DOOM 2 had only one HELP
      //  page. I use CREDIT as second page now, but
      //  kept this hack for educational purposes.

      mainMenu[MainEnum.ReadThis] = mainMenu[MainEnum.QuitDoom]
      mainDef.numItems--
      mainDef.y += 8
      newDef.prevMenu = mainDef
      readDef1.routine = drawReadThis1
      readDef1.x = 330
      readDef1.y = 165
      readMenu1[0].routine = finishReadThis
      break

    case GameMode.Shareware:
      // Episode 2 and 3 are handled,
      //  branching to an ad screen.
      // fallthrough
    case GameMode.Registered:
      // We need to remove the fourth episode.
      epiDef.numItems--
      break
    case GameMode.Retail:
      // We are fine.
      break
    default:
      break
    }
  }
}
