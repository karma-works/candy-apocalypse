import { AutoMap } from '../auto-map/auto-map'
import { Ceilings } from './ceilings'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom'
import { Doors } from './doors'
import { Enemy } from './enemy'
import { Floor } from './floor'
import { Game } from '../game/game'
import { GameMode } from '../doom/mode'
import { Inter } from './inter'
import { Level } from '../level/level'
import { Lights } from './lights'
import { LumpReader } from '../wad/lump-reader'
import { MAX_PLAYERS } from '../global/doomdef'
import { MObjHandler } from './mobj-handler'
import { Map } from './map'
import { MapThing } from '../level/thing-array'
import { MapUtils } from './map-utils'
import { PSprite } from './p-sprite'
import { Plats } from './plats'
import { Data as RData } from '../rendering/data'
import { SaveGame } from './save-game'
import { Sight } from './sight'
import { Special } from './special'
import { Switch } from './switch'
import { Teleport } from './teleport'
import { Tick } from './tick'
import { User } from './user'

export class Play {
  // increment every time a check is made
  validCount = 1;

  public level = new Level()

  public tick = new Tick(this)
  public ceilings = new Ceilings(this)
  public doors = new Doors(this)
  public enemy = new Enemy(this)
  public floor = new Floor(this)
  public inter = new Inter(this)
  public lights = new Lights(this)
  public map = new Map(this)
  public mapUtils = new MapUtils(this)
  public mObjHandler = new MObjHandler(this)
  public plats = new Plats(this)
  public pSprite = new PSprite(this)
  public saveGame = new SaveGame(this)
  public sight = new Sight(this)
  public special = new Special(this)
  public switch = new Switch(this)
  public teleport = new Teleport(this)
  public user = new User(this)

  get autoMap(): AutoMap {
    return this.doom.autoMap
  }
  get dSound(): DSound {
    return this.doom.dSound
  }
  get rData(): RData {
    return this.doom.rData
  }
  get wad(): LumpReader {
    return this.doom.wad
  }
  get game(): Game {
    return this.doom.game
  }

  constructor(public doom: Doom) { }

  //
  // P_LoadThings
  //
  private spawnThings(level: Level) {
    let mt: MapThing
    let spawn: boolean
    for (mt of level.things) {
      spawn = true

      // Do not spawn cool, new monsters if !commercial
      if (this.doom.gameMode !== GameMode.Commercial) {
        switch (mt.type) {
        /* eslint-disable line-comment-position */
        case 68: // Arachnotron
        case 64: // Archvile
        case 88: // Boss Brain
        case 89: // Boss Shooter
        case 69: // Hell Knight
        case 67: // Mancubus
        case 71: // Pain Elemental
        case 65: // Former Human Commando
        case 66: // Revenant
        case 84: // Wolf SS
          spawn = false
          break
        /* eslint-enable line-comment-position */
        }
      }
      if (spawn === false) {
        break
      }

      this.mObjHandler.spawnMapThing(mt)
    }
  }

  //
  // P_SetupLevel
  //
  setupLevel(episode: number, map: number): void {
    this.doom.game.totalKills =
        this.doom.game.totalItems =
        this.doom.game.totalSecret = 0

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      this.doom.game.players[i].killCount =
          this.doom.game.players[i].secretCount =
          this.doom.game.players[i].itemCount = 0
    }

    // Initial height of PointOfView
    // will be set by player think.
    this.doom.game.player.viewZ = 1

    // Make sure all sounds are stopped before Z_FreeTags.
    this.dSound.start()

    // UNUSED W_Profile ();
    this.tick.initThinkers()

    let lumpName: string
    if (this.doom.gameMode === GameMode.Commercial) {
      if (map < 10) {
        lumpName = `map0${map}`
      } else {
        lumpName = `map${map}`
      }
    } else {
      lumpName = `E${episode}M${map}`
    }

    const level = this.wad.cacheLumpName(lumpName, Level, false)
    this.level = level

    this.tick.levelTime = 0
    this.game.bodyQueSlot = 0

    level.load(this.wad,
      this.rData.flats,
      this.rData.textures)

    this.spawnThings(level)

    // set up world state
    this.special.spawnSpecials()
  }

  //
  // P_Init
  //
  init(): void {
    this.switch.initSwitchList()
    this.special.initPicAnims()
  }
}
