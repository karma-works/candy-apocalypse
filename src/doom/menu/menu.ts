import { DEvent, EvType } from '../doom/event'
import { GameMode, GameVersion } from '../doom/mode'
import { HU_FONTSIZE, HU_FONTSTART, HeadsUp } from '../heads-up/stuff'
import { LoadGameMenu, SaveGameMenu } from './save-game'
import { MainEnum, MainMenu } from './main'
import { MenuItem, MenuStruct } from './typedefs'
import { Sound, SoundMenu } from './sound'
import { AutoMap } from '../auto-map/auto-map'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom'
import { Game } from '../game/game'
import { Video as IVideo } from '../interfaces/video'
import { LumpReader } from '../wad/lump-reader'
import { OptionsMenu } from './options'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'
import { ReadThisCommercialMenu } from './read-this'
import { Rendering } from '../rendering/rendering'
import { SCREENWIDTH } from '../global/doomdef'
import { ScanCode } from '../interfaces/scancodes'
import { SfxName } from '../doom/sounds/sfx-name'
import { Strings } from '../translation/strings'
import { getTime } from '../system/system'
import { toupper } from '../utils/c'

const SKULLOFF = -32
export const LINEHEIGHT = 16

export class Menu {

  // 1 = message to be printed
  private messageToPrint = false
  // ...and here is the message string!
  private messageString: string | null = null

  private messageLastMenuActive = false

  // timed message = no input from user
  messageNeedsInput = false
  messageRoutine?: (response: number) => void

  inHelpScreens = false
  menuActive = false

  // menu item skull is on
  itemOn = 0
  // skull animation counter
  private skullAnimCounter = 0
  // which skull to draw
  private whichSkull = 0

  // graphic name of skulls
  // warning: initializer-string for array of chars is too long
  private skullName = [ 'M_SKULL1', 'M_SKULL2' ]

  // current menudef
  mainMenu = new MainMenu(this)
  private get optionsMenu(): OptionsMenu {
    return this.mainMenu.optionsMenu
  }
  private get soundMenu(): SoundMenu {
    return this.optionsMenu.soundMenu
  }
  private get loadMenu(): LoadGameMenu {
    return this.mainMenu.loadMenu
  }
  private get saveMenu(): SaveGameMenu {
    return this.mainMenu.saveMenu
  }

  currentMenu: MenuStruct = this.mainMenu

  quickSaveSlot = 0

  private get autoMap(): AutoMap {
    return this.doom.autoMap
  }
  get dSound(): DSound {
    return this.doom.dSound
  }
  get game(): Game {
    return this.doom.game
  }
  get headsUp(): HeadsUp {
    return this.doom.headsUp
  }
  private get iVideo(): IVideo {
    return this.doom.iVideo
  }
  get rendering(): Rendering {
    return this.doom.rendering
  }
  get rVideo(): RVideo {
    return this.rendering.video
  }
  get strings(): Strings {
    return this.doom.strings
  }
  get wad(): LumpReader {
    return this.doom.wad
  }

  constructor(public doom: Doom) {}

  //
  //      Menu Functions
  //
  drawThermo(x: number, y: number, thermWidth: number, thermDot: number): void {
    let xx = x
    this.rVideo.drawPatch(
      xx, y, 0,
      this.wad.cacheLumpName('M_THERML', Patch),
    )
    xx += 8
    for (let i = 0; i < thermWidth; ++i) {
      this.rVideo.drawPatch(
        xx, y, 0,
        this.wad.cacheLumpName('M_THERMM', Patch),
      )
      xx += 8
    }
    this.rVideo.drawPatch(
      xx, y, 0,
      this.wad.cacheLumpName('M_THERMR', Patch),
    )
    this.rVideo.drawPatch(
      x + 8 + thermDot * 8, y, 0,
      this.wad.cacheLumpName('M_THERMO', Patch),
    )
  }

  startMessage(str: string, input: false): void
  startMessage<T>(str: string, input: true,
    routine: (response: number) => void): void
  startMessage<T>(
    str: string,
    input: boolean,
    routine?: (response: number) => void,
  ): void {
    this.messageLastMenuActive = this.menuActive
    this.messageToPrint = true
    this.messageString = str
    this.messageRoutine = routine
    this.messageNeedsInput = input
    this.menuActive = true
    return
  }
  stopMessage(): void {
    this.menuActive = this.messageLastMenuActive
    this.messageToPrint = false
  }

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

      this.rVideo.drawPatch(cx, cy, 0, this.headsUp.font[c])

      cx += w
    }
  }

  //
  // CONTROL PANEL
  //

  //
  // M_Responder
  //
  private joywait = 0
  private mousewait = 0
  private mousey = 0
  private lasty = 0
  private mousex = 0
  private lastx = 0
  responder(ev: DEvent): boolean {
    let key = -1
    let ch = -1

    if (ev.type === EvType.Joystick && this.joywait < getTime()) {
      if (ev.data3 === -1) {
        key = ScanCode.ArrowUp
        this.joywait = getTime() + 5
      } else if (ev.data3 === 1) {
        key = ScanCode.ArrowDown
        this.joywait = getTime() + 5
      }

      if (ev.data2 === -1) {
        key = ScanCode.ArrowLeft
        this.joywait = getTime() + 2
      } else if (ev.data2 === 1) {
        key = ScanCode.ArrowRight
        this.joywait = getTime() + 2
      }

      if (ev.data1 & 1) {
        key = ScanCode.Enter
        this.joywait = getTime() + 5
      }
      if (ev.data1 & 2) {
        key = ScanCode.Backspace
        this.joywait = getTime() + 5
      }
    } else {
      if (ev.type === EvType.Mouse && this.mousewait < getTime()) {
        this.mousey += ev.data3
        if (this.mousey < this.lasty - 30) {
          key = ScanCode.ArrowDown
          this.mousewait = getTime() + 5
          this.mousey = this.lasty -= 30
        } else if (this.mousey > this.lasty + 30) {
          key = ScanCode.ArrowUp
          this.mousewait = getTime() + 5
          this.mousey = this.lasty += 30
        }

        this.mousex += ev.data2
        if (this.mousex < this.lastx - 30) {
          key = ScanCode.ArrowLeft
          this.mousewait = getTime() + 5
          this.mousex = this.lastx -= 30
        } else if (this.mousex > this.lastx + 30) {
          key = ScanCode.ArrowRight
          this.mousewait = getTime() + 5
          this.mousex = this.lastx += 30
        }

        if (ev.data1 & 1) {
          key = ScanCode.Enter
          this.mousewait = getTime() + 15
        }
        if (ev.data1 & 2) {
          key = ScanCode.Backspace
          this.mousewait = getTime() + 15
        }
      } else {
        if (ev.type === EvType.KeyDown) {
          key = ev.data1
          ch = ev.data2
        }
      }
    }

    if (key === -1) {
      return false
    }

    // Save Game string input
    if (this.saveMenu.responder(key, ch)) {
      return true
    }

    // Take care of any messages that need input
    if (this.messageToPrint) {
      if (this.messageNeedsInput &&
        !(key === ScanCode.Space ||
          key === ScanCode.KeyN ||
          key === ScanCode.KeyY ||
          key === ScanCode.Escape)) {
        return false
      }

      this.menuActive = this.messageLastMenuActive
      this.messageToPrint = false
      if (this.messageRoutine) {
        this.messageRoutine.call(this.currentMenu, key)
      }

      this.menuActive = false
      this.dSound.startSound(null, SfxName.Swtchx)
      return true
    }

    // F-Keys
    if (!this.menuActive) {
      switch (key) {
      // Screen size down
      case ScanCode.Minus:
        if (this.autoMap.active || this.headsUp.chatOn) {
          return false
        }
        this.optionsMenu.sizeDisplay(0)
        this.dSound.startSound(null, SfxName.Stnmov)
        return true

      // Screen size up
      case ScanCode.Equal:
        if (this.autoMap.active || this.headsUp.chatOn) {
          return false
        }
        this.optionsMenu.sizeDisplay(1)
        this.dSound.startSound(null, SfxName.Stnmov)
        return true

      // Help key
      case ScanCode.F1:
        this.startControlPanel()

        if (this.doom.gameVersion >= GameVersion.Ultimate) {
          this.currentMenu = this.mainMenu.readThis2Menu
        } else {
          this.currentMenu = this.mainMenu.readThis1Menu
        }

        this.itemOn = 0
        this.dSound.startSound(null, SfxName.Swtchn)
        return true

      // Save
      case ScanCode.F2:
        this.startControlPanel()
        this.dSound.startSound(null, SfxName.Swtchn)
        this.mainMenu.saveGame()
        return true

      // Load
      case ScanCode.F3:
        this.startControlPanel()
        this.dSound.startSound(null, SfxName.Swtchn)
        this.mainMenu.loadGame()
        return true

      // Sound Volume
      case ScanCode.F4:
        this.startControlPanel()
        this.currentMenu = this.soundMenu
        this.itemOn = Sound.SfxVol
        this.dSound.startSound(null, SfxName.Swtchn)
        return true

      // Detail toggle
      case ScanCode.F5:
        this.optionsMenu.changeDetail()
        this.dSound.startSound(null, SfxName.Swtchn)
        return true

      // Quicksave
      case ScanCode.F6:
        this.dSound.startSound(null, SfxName.Swtchn)
        this.saveMenu.quickSave()
        return true

      // End game
      case ScanCode.F7:
        this.dSound.startSound(null, SfxName.Swtchn)
        // Workaround
        this.currentMenu = this.optionsMenu
        this.optionsMenu.endGame()
        return true

      // Toggle messages
      case ScanCode.F8:
        this.optionsMenu.changeMessages()
        this.dSound.startSound(null, SfxName.Swtchn)
        return true

      // Quickload
      case ScanCode.F9:
        this.dSound.startSound(null, SfxName.Swtchn)
        this.loadMenu.quickLoad()
        return true

      // Quit DOOM
      case ScanCode.F10:
        this.dSound.startSound(null, SfxName.Swtchn)
        this.mainMenu.quitDOOM()
        return true

      // gamma toggle
      case ScanCode.F11:
        this.iVideo.useGamma++
        if (this.iVideo.useGamma > 4) {
          this.iVideo.useGamma = 0
        }
        this.iVideo.uploadNewPalette()

        this.saveDefaults()

        return true
      }
    }

    // Pop-up menu?
    if (!this.menuActive) {
      if (key === ScanCode.Escape) {
        this.startControlPanel()
        this.dSound.startSound(null, SfxName.Swtchn)
        return true
      }
      return false
    }

    // Keys usable within menu
    let item: MenuItem
    switch (key) {
    case ScanCode.ArrowDown:
      do {
        if (this.itemOn + 1 > this.currentMenu.numItems - 1) {
          this.itemOn = 0
        } else {
          this.itemOn++
        }
        this.dSound.startSound(null, SfxName.Pstop)
      } while (this.currentMenu.menuItems[this.itemOn].status === -1)
      return true

    case ScanCode.ArrowUp:
      do {
        if (!this.itemOn) {
          this.itemOn = this.currentMenu.numItems - 1
        } else {
          this.itemOn--
        }
        this.dSound.startSound(null, SfxName.Pstop)
      } while (this.currentMenu.menuItems[this.itemOn].status === -1)
      return true

    case ScanCode.ArrowLeft: {
      const item = this.currentMenu.menuItems[this.itemOn]
      if (item.status === 2) {
        this.dSound.startSound(null, SfxName.Stnmov)
        item.routine.call(this.currentMenu, 0)
      }
      return true
    }

    case ScanCode.ArrowRight: {
      const item = this.currentMenu.menuItems[this.itemOn]
      if (item.status === 2) {
        this.dSound.startSound(null, SfxName.Stnmov)
        item.routine.call(this.currentMenu, 1)
      }
      return true
    }

    case ScanCode.Enter: {
      const item = this.currentMenu.menuItems[this.itemOn]
      if (item.status === 1 || item.status === 2) {
        this.currentMenu.lastOn = this.itemOn
        if (item.status === 2) {
          // right arrow
          item.routine.call(this.currentMenu, 1)
          this.dSound.startSound(null, SfxName.Stnmov)
        } else {
          item.routine.call(this.currentMenu, this.itemOn)
          this.dSound.startSound(null, SfxName.Pistol)
        }
      }
      return true
    }

    case ScanCode.Escape:
      this.currentMenu.lastOn = this.itemOn
      this.clearMenus()
      this.dSound.startSound(null, SfxName.Swtchx)
      return true

    case ScanCode.Backspace:
      this.currentMenu.lastOn = this.itemOn
      if (this.currentMenu.prevMenu) {
        this.currentMenu = this.currentMenu.prevMenu
        this.itemOn = this.currentMenu.lastOn
        this.dSound.startSound(null, SfxName.Swtchn)
      }
      return true

    default:
      for (let i = this.itemOn + 1; i < this.currentMenu.numItems; ++i) {
        item = this.currentMenu.menuItems[i]
        if ((item.status === 1 || item.status === 2) &&
          item.alphaKey === String.fromCharCode(key)
        ) {
          this.itemOn = i
          this.dSound.startSound(null, SfxName.Pstop)
          return true
        }
      }
      for (let i = 0; i <= this.itemOn; ++i) {
        item = this.currentMenu.menuItems[i]
        if ((item.status === 1 || item.status === 2) &&
          item.alphaKey === String.fromCharCode(key)
        ) {
          this.itemOn = i
          this.dSound.startSound(null, SfxName.Pstop)
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
    this.currentMenu = this.mainMenu
    this.itemOn = this.currentMenu.lastOn
  }

  //
  // M_Drawer
  // Called after the view has been rendered,
  // but before it has been blitted.
  //
  private x = 0
  private y = 0
  drawer(): void {
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

    // call Draw routine
    this.currentMenu.routine.call(this.currentMenu)

    // DRAW MENU
    this.x = this.currentMenu.x
    this.y = this.currentMenu.y
    const max = this.currentMenu.numItems

    let item: MenuItem
    for (let i = 0; i < max; ++i) {
      item = this.currentMenu.menuItems[i]
      if ((item.status === 1 || item.status === 2) &&
        item.name
      ) {
        this.rVideo.drawPatch(
          this.x, this.y, 0,
          this.wad.cacheLumpName(item.name, Patch),
        )
      }
      this.y += LINEHEIGHT
    }

    this.rVideo.drawPatch(
      this.x + SKULLOFF,
      this.currentMenu.y - 5 + this.itemOn * LINEHEIGHT,
      0,
      this.wad.cacheLumpName(this.skullName[this.whichSkull], Patch),
    )

  }

  //
  // M_ClearMenus
  //
  clearMenus(): void {
    this.menuActive = false
  }

  //
  // M_SetupNextMenu
  //
  setupNextMenu(menuDef: MenuStruct): void {
    this.currentMenu = menuDef
    this.itemOn = this.currentMenu.lastOn
  }

  saveDefaults(): void {
    this.doom.defaults.save()
  }

  //
  // M_Ticker
  //
  ticker(): void {
    if (--this.skullAnimCounter <= 0) {
      this.whichSkull ^= 1
      this.skullAnimCounter = 8
    }
  }

  init(): void {
    this.currentMenu = this.mainMenu
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

    // The same hacks were used in the original Doom EXEs.

    if (this.doom.gameVersion >= GameVersion.Final && this.doom.gameVersion <= GameVersion.Final2) {
      this.mainMenu.readThis2Menu = new ReadThisCommercialMenu(this.mainMenu)
      this.mainMenu.readThis2Menu.prevMenu = this.mainMenu
      this.mainMenu.readThis2Menu.nextMenu = this.mainMenu
    }

    if (this.doom.gameMode === GameMode.Commercial) {
      this.mainMenu.menuItems.splice(MainEnum.ReadThis)
      this.mainMenu.numItems--
      this.mainMenu.y += 8

      this.mainMenu.readThis1Menu = new ReadThisCommercialMenu(this.mainMenu)
      this.mainMenu.readThis1Menu.prevMenu = this.mainMenu
      this.mainMenu.readThis1Menu.nextMenu = this.mainMenu
    }

    // Versions of doom.exe before the Ultimate Doom release only had
    // three episodes; if we're emulating one of those then don't try
    // to show episode four. If we are, then do show episode four
    // (should crash if missing).
    if (this.doom.gameVersion < GameVersion.Ultimate) {
      this.mainMenu.episodeMenu.numItems--
    } else if (this.doom.gameVersion === GameVersion.Chex) {
      // chex.exe shows only one episode.
      this.mainMenu.episodeMenu.numItems = 1
    }
  }
}
