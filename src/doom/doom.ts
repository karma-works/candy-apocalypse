import { GameMission, GameMode, GameState, Language, VERSION } from '../global/doomdef'
import { HeadsUp } from '../heads-up/stuff'
import { Video as IVideo } from '../interfaces/video'
import { Menu } from '../menu/menu'
import { Video as RVIdeo } from '../rendering/video'
import { Rendering } from '../rendering/rendering'
import { Wad } from '../wad/wad'

async function access(file: string): Promise<boolean> {
  return (await fetch(file)).ok
}

export class Doom {

  // Game Mode - identify IWAD as shareware, retail etc.
  gameMode: GameMode = GameMode.Indetermined
  gameMission: GameMission = GameMission.Doom

  // Language
  language: Language = Language.English

  // Set if homebrew PWAD stuff has been added.
  modifiedGame = false

  //?
  gameState: GameState = GameState.DemoScreen


  private wadfiles: string[] = []

  // print title for every printed line
  private title = ''

  private wad = new Wad()
  private headsUp = new HeadsUp(this.wad)
  private rendering = new Rendering()
  private rvideo = new RVIdeo()
  private ivideo = new IVideo(this.rvideo)
  private menu = new Menu(this, this.headsUp, this.ivideo, this.rvideo, this.wad)

  // wipegamestate can be set to -1 to force a wipe on the next draw
  private wipeGameState = GameState.DemoScreen
  private oldGameState: GameState = -1
  private borderDrawCount = 0
  //
  // D_Display
  //  draw current display, possibly wiping it from the previous
  //
  private async display(): Promise<void> {
    let wipe: boolean

    // change the view size if needed
    if (this.rendering.setSizeNeeded) {
      this.rendering.executeSetViewSize()
      // force background redraw
      this.oldGameState = -1
      this.borderDrawCount = 3
    }

    // save the current screen if about to wipe
    if (this.gameState !== this.wipeGameState) {
      wipe = true
    } else {
      wipe = false
    }

    // clean up border stuff
    if (this.gameState !== this.oldGameState &&
        this.gameState !== GameState.Level) {
      this.ivideo.setPalette(await this.wad.cacheLumpName('PLAYPAL'))
    }

    this.oldGameState = this.wipeGameState = this.gameState

    // menus go directly to the screen
    // menu is drawn even on top of everything
    await this.menu.drawer()

    // normal update
    if (!wipe) {
      // page flip or blit buffer
      this.ivideo.finishUpdate()
      return
    }
  }

  //
  // D-DoomLoop()
  // Not a globally visible function,
  //  just included for source reference,
  //  called by D_DoomMain, never exits.
  // Manages timing and IO,
  //  calls all ?_Responder, ?_Ticker, and ?_Drawer,
  //  calls I_GetTime, I_StartFrame, and I_StartTic
  //
  private doomLoop(): void {
    this.ivideo.initGraphics()
    this.renderFrame()
  }
  private renderFrame(): void {
    requestAnimationFrame(async() => {
      await this.display()
      this.renderFrame()
    })
  }

  //
  // D_AddFile
  //
  private addFile(file: string) {
    this.wadfiles.push(file)
  }

  //
  // IdentifyVersion
  // Checks availability of IWAD files by name,
  // to determine whether registered/commercial features
  // should be executed (notably loading PWAD's).
  //
  private async identifyVersion(): Promise<void> {
    const doomWadDir = './data'
    // Commercial.
    const doom2wad = `${doomWadDir}/doom2.wad`

    // Retail.
    const doomuwad = `${doomWadDir}/doomu.wad`

    // Registered.
    const doomwad = `${doomWadDir}/doom.wad`

    // Shareware.
    const doom1wad = `${doomWadDir}/doom1.wad`

    const plutoniawad = `${doomWadDir}/plutonia.wad`

    const tntwad = `${doomWadDir}/tnt.wad`

    // French stuff.
    const doom2fwad = `${doomWadDir}/doom2f.wad`

    if (await access(doom2fwad)) {
      this.gameMode = GameMode.Commercial
      // C'est ridicule!
      // Let's handle languages in config files, okay?
      this.language = Language.French
      console.log('French version')
      this.addFile(doom2fwad)
      return
    }
    if (await access(doom2wad)) {
      this.gameMode = GameMode.Commercial
      this.addFile(doom2wad)
      return
    }
    if (await access(plutoniawad)) {
      this.gameMode = GameMode.Commercial
      this.addFile(plutoniawad)
      return
    }
    if (await access(tntwad)) {
      this.gameMode = GameMode.Commercial
      this.addFile(tntwad)
      return
    }
    if (await access(doomuwad)) {
      this.gameMode = GameMode.Retail
      this.addFile(doomuwad)
      return
    }
    if (await access(doomwad)) {
      this.gameMode = GameMode.Registered
      this.addFile(doomwad)
      return
    }
    if (await access(doom1wad)) {
      this.gameMode = GameMode.Shareware
      this.addFile(doom1wad)
      return
    }

    console.log('Game mode indeterminate')
    this.gameMode = GameMode.Indetermined

    // We don't abort. Let's see what the PWAD contains.
  }

  async init(): Promise<void> {
    await this.identifyVersion()

    switch (this.gameMode) {
    case GameMode.Retail:
      this.title = '                         ' +
        `The Ultimate DOOM Startup v${Math.floor(VERSION / 100)}.${VERSION % 100}` +
        '                           '
      break
    case GameMode.Shareware:
      this.title = '                            ' +
        `DOOM Shareware Startup v${Math.floor(VERSION / 100)}.${VERSION % 100}` +
        '                           '
      break
    case GameMode.Registered:
      this.title = '                            ' +
        `DOOM Registered Startup v${Math.floor(VERSION / 100)}.${VERSION % 100}` +
        '                           '
      break
    case GameMode.Commercial:
      this.title = '                         ' +
        `DOOM 2: Hell on Earth v${Math.floor(VERSION / 100)}.${VERSION % 100}` +
        '                           '
      break
    default:
      this.title = '                     ' +
        `Public DOOM - v${Math.floor(VERSION / 100)}.${VERSION % 100}` +
        '                           '
      break
    }

    console.log(this.title)

    // init subsystems
    console.log('V_Init: allocate screens.')
    this.rvideo.init()

    console.log('W_Init: Init WADfiles.')
    await this.wad.initMultipleFiles(this.wadfiles)

    // Check and print which version is executed.
    switch (this.gameMode) {
    case GameMode.Shareware:
    case GameMode.Indetermined:
      console.log('===========================================================================')
      console.log('                                Shareware!')
      console.log('===========================================================================')
      break
    case GameMode.Registered:
    case GameMode.Retail:
    case GameMode.Commercial:
      console.log('===========================================================================')
      console.log('                 Commercial product - do not distribute!')
      console.log('         Please report software piracy to the SPA: 1-800-388-PIR8')
      console.log('===========================================================================')
      break
    default:
      // Ouch.
      break
    }

    console.log('M_Init: Init miscellaneous info.')
    this.menu.init()
    this.menu.startControlPanel()

    console.log('R_Init: Init DOOM refresh daemon - ')
    this.rendering.init()

    console.log('HU_Init: Setting up heads up display.')
    await this.headsUp.init()

    this.doomLoop()
  }
}

