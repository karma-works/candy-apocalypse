import { GameMission, GameMode, GameVersion } from './mode';
import { LumpReader } from '../wad/lump-reader';
import { Params } from './params';

type InstanceParams = Pick<Params, 'gameVersion'|'pack'>

export class GameInstance {
  mode = GameMode.Indetermined
  mission = GameMission.Doom
  version: GameVersion
  pack?: string

  get logicalMission() {
    return this.mission === GameMission.PackChex ?
      GameMission.Doom :
      this.mission === GameMission.PackHacx ?
        GameMission.Doom2 : this.mission
  }

  get demoSequenceCount() {
    if (this.version === GameVersion.Ultimate || this.version === GameVersion.Final) {
      return 7
    }
    return 6
  }

  get creditPatch() {
    if (this.version >= GameVersion.Ultimate) {
      return 'CREDIT'
    }
    return 'HELP2'
  }

  constructor(
    {
      gameVersion = GameVersion.Undefined,
      pack,
    }: InstanceParams,
    private wad: LumpReader = new LumpReader(),
  ) {
    this.version = gameVersion
    this.pack = pack

    if (!wad.fileNames[0]) {
      return
    }

    this.identifyWadByName(wad.fileNames[0])
    this.identifyVersion()
    this.initGameVersion()
  }

  getSkyPatch(episode: number, map: number) {
    let patch = 'SKY1'

    // set the sky map for the episode
    if (this.mode === GameMode.Commercial) {
      patch = 'SKY3'
      if (map < 12) {
        patch = 'SKY1'
      } else if (map < 21) {
        patch = 'SKY2'
      }
    } else {
      switch (episode) {
      case 1:
        patch = 'SKY1'
        break
      case 2:
        patch = 'SKY2'
        break
      case 3:
        patch = 'SKY3'
        break
      case 4:
        // Special Edition sky
        patch = 'SKY4'
        break
      }
    }

    if (this.mode as GameMode === GameMode.Commercial &&
      (this.version === GameVersion.Final2 || this.version === GameVersion.Chex)) {
      patch = 'SKY3'
      if (map < 12) {
        patch = 'SKY1'
      } else if (map < 21) {
        patch = 'SKY2'
      }
    }

    return patch
  }

  private identifyWadByName(iwad: string) {
    const lastSlash = iwad.lastIndexOf('/')
    if (lastSlash >= 0) {
      iwad = iwad.slice(lastSlash + 1)
    }

    let mission = GameMission.None

    const wad = wads.find(([ wadFileName ]) =>
      wadFileName.toUpperCase() === iwad.toUpperCase())

    if (wad !== undefined) {
      mission = wad[1]
    }

    this.mission = mission
  }

  //
  // Find out what version of Doom is playing.
  //
  private identifyVersion(): void {
    // gamemission is set up by the D_FindIWAD function.  But if
    // we specify '-iwad', we have to identify using
    // IdentifyIWADByName.  However, if the iwad does not match
    // any known IWAD name, we may have a dilemma.  Try to
    // identify by its contents.

    if (this.mission === GameMission.None) {
      for (let i = 0; i < this.wad.numLumps; ++i) {
        if (this.wad.lumpInfo[i].name.toUpperCase() === 'MAP01') {
          this.mission = GameMission.Doom2
          break

        } else if (this.wad.lumpInfo[i].name.toUpperCase() === 'E1M1') {
          this.mission = GameMission.Doom
          break
        }
      }

      if (this.mission === GameMission.None) {
        // Still no idea.  I don't think this is going to work.

        throw 'Unknown or invalid IWAD file.'
      }
    }

    // Make sure gamemode is set up correctly

    if (this.logicalMission === GameMission.Doom) {
      // Doom 1.  But which version?

      if (this.wad.checkNumForName('E4M1') > 0) {
        // Ultimate Doom

        this.mode = GameMode.Retail
      } else if (this.wad.checkNumForName('E3M1') > 0) {
        this.mode = GameMode.Registered
      } else {
        this.mode = GameMode.Shareware
      }
    } else {
      // Doom 2 of some kind.
      this.mode = GameMode.Commercial

      // We can manually override the gamemission that we got from the
      // IWAD detection code. This allows us to eg. play Plutonia 2
      // with Freedoom and get the right level names.

      //!
      // @category compat
      // @arg <pack>
      //
      // Explicitly specify a Doom II "mission pack" to run as, instead of
      // detecting it based on the filename. Valid values are: "doom2",
      // "tnt" and "plutonia".
      //
      if (this.pack) {
        this.mission = this.setMissionForPackName(this.pack)
      }
    }
  }

  private initGameVersion(): void {
    if (this.version !== GameVersion.Undefined) {
      return
    }

    // Determine automatically

    if (this.mission === GameMission.PackChex) {
      // chex.exe - identified by iwad filename

      this.version = GameVersion.Chex
    } else if (this.mission === GameMission.PackHacx) {
      // hacx.exe: identified by iwad filename

      this.version = GameVersion.Hacx
    } else if (this.mode === GameMode.Shareware ||
      this.mode === GameMode.Registered ||
      this.mode === GameMode.Commercial &&
      this.mission === GameMission.Doom2
    ) {
      // original
      this.version = GameVersion.Doom19

      // Detect version from demo lump
      let demoLumpName: string
      let demoLump: Uint8Array
      let demoVersion: number
      let status: boolean
      for (let i = 1; i <= 3; ++i) {
        demoLumpName = `demo${i}`
        if (this.wad.checkNumForName(demoLumpName) > 0) {
          demoLump = new Uint8Array(this.wad.cacheLumpName(demoLumpName))
          demoVersion = demoLump[0]
          status = true
          switch (demoVersion) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
            this.version = GameVersion.Doom12
            break
          case 106:
            this.version = GameVersion.Doom1666
            break
          case 107:
            this.version = GameVersion.Doom17
            break
          case 108:
            this.version = GameVersion.Doom18
            break
          case 109:
            this.version = GameVersion.Doom19
            break
          default:
            status = false
            break
          }
          if (status) {
            break
          }
        }
      }
    } else if (this.mode === GameMode.Retail) {
      this.version = GameVersion.Ultimate
    } else if (this.mode === GameMode.Commercial) {
      // Final Doom: tnt or plutonia
      // Defaults to emulating the first Final Doom executable,
      // which has the crash in the demo loop; however, having
      // this as the default should mean that it plays back
      // most demos correctly.

      this.version = GameVersion.Final
    }


    // Deathmatch 2.0 did not exist until Doom v1.4
    // if (this.version <= GameVersion.Doom12 && this.game.deathMatch === 2) {
    //   this.game.deathMatch = 1
    // }

    // The original exe does not support retail - 4th episode not supported

    if (this.version < GameVersion.Ultimate &&
      this.mode === GameMode.Retail
    ) {
      this.mode = GameMode.Registered
    }

    // EXEs prior to the Final Doom exes do not support Final Doom.

    if (this.version < GameVersion.Final &&
      this.mode === GameMode.Commercial &&
      (this.mission === GameMission.PackTNT ||
        this.mission === GameMission.PackPlut)
    ) {
      this.mission = GameMission.Doom2
    }
  }


  private setMissionForPackName(packName: string): GameMission {
    const packs: { [k: string]: GameMission } = {
      'doom2': GameMission.Doom2,
      'tnt': GameMission.PackTNT,
      'plutonia': GameMission.PackPlut,
    }

    if (packName.toLowerCase() in packs) {
      return packs[packName.toLowerCase()]
    }

    console.log('Valid mission packs are:')
    Object.keys(packs).forEach(s => console.log(`  ${s}`))

    throw `Unknown mission pack name: ${packName}`
  }
}


const wads: readonly [ string, GameMission, GameMode, string ][] = [
  [ 'doom2.wad', GameMission.Doom2, GameMode.Commercial, 'Doom II' ],
  [ 'plutonia.wad', GameMission.PackPlut, GameMode.Commercial, 'Final Doom: Plutonia Experiment' ],
  [ 'tnt.wad', GameMission.PackTNT, GameMode.Commercial, 'Final Doom: TNT: Evilution' ],
  [ 'doom.wad', GameMission.Doom, GameMode.Retail, 'Doom' ],
  [ 'doom1.wad', GameMission.Doom, GameMode.Shareware, 'Doom Shareware' ],
  [ 'chex.wad', GameMission.PackChex, GameMode.Retail, 'Chex Quest' ],
  [ 'hacx.wad', GameMission.PackHacx, GameMode.Commercial, 'Hacx' ],
  [ 'freedoom2.wad', GameMission.Doom2, GameMode.Commercial, 'Freedoom: Phase 2' ],
  [ 'freedoom1.wad', GameMission.Doom, GameMode.Retail, 'Freedoom: Phase 1' ],
  [ 'freedm.wad', GameMission.Doom2, GameMode.Commercial, 'FreeDM' ],
  [ 'heretic.wad', GameMission.Heretic, GameMode.Retail, 'Heretic' ],
  [ 'heretic1.wad', GameMission.Heretic, GameMode.Shareware, 'Heretic Shareware' ],
  [ 'hexen.wad', GameMission.Hexen, GameMode.Commercial, 'Hexen' ],
  [ 'strife1.wad', GameMission.Strife, GameMode.Commercial, 'Strife' ],
]
