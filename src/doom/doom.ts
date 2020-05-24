import { GameMission, GameMode, Language, VERSION } from '../global/doomdef'
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

  private wadfiles: string[] = []

  // print title for every printed line
  private title = ''

  private wad: Wad = new Wad()

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
  }
}

