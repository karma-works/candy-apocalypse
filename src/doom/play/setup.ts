import { MAP_BLOCK_SHIFT, MAX_RADIUS } from './local'
import { MapLumpOrder, MapSideDef } from '../doom/data'
import { MapThing, ThingArray } from '../level/thing-array'
import { AutoMap } from '../auto-map/auto-map'
import { BBox } from '../misc/bbox'
import { Ceilings } from './ceilings'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom'
import { Doors } from './doors'
import { Enemy } from './enemy'
import { FRACBITS } from '../misc/fixed'
import { Floor } from './floor'
import { Game } from '../game/game'
import { GameMode } from '../doom/mode'
import { Inter } from './inter'
import { Lights } from './lights'
import { Line } from '../rendering/defs/line'
import { LineArray } from '../level/line-array'
import { LumpReader } from '../wad/lump-reader'
import { MAX_PLAYERS } from '../global/doomdef'
import { MObj } from './mobj/mobj'
import { MObjHandler } from './mobj-handler'
import { Map } from './map'
import { MapUtils } from './map-utils'
import { Node } from '../rendering/bsp/node'
import { NodeArray } from '../level/node-array'
import { PSprite } from './p-sprite'
import { Plats } from './plats'
import { Rendering } from '../rendering/rendering'
import { SaveGame } from './save-game'
import { Sector } from '../rendering/defs/sector'
import { SectorArray } from '../level/sector-array'
import { Seg } from '../rendering/segs/seg'
import { SegArray } from '../level/seg-array'
import { Side } from '../rendering/defs/side'
import { Sight } from './sight'
import { Special } from './special'
import { SubSector } from '../rendering/defs/sub-sector'
import { SubSectorArray } from '../level/sub-sector-array'
import { Switch } from './switch'
import { Teleport } from './teleport'
import { Tick } from './tick'
import { User } from './user'
import { Vertex } from '../rendering/data/vertex'
import { VertexArray } from '../level/vertex-array'
import { sprNames } from '../doom/info/spr-names'

export class Play {
  //
  // MAP related Lookup tables.
  // Store VERTEXES, LINEDEFS, SIDEDEFS, etc.
  //
  vertexes = new Array<Vertex>()

  segs = new Array<Seg>()

  sectors = new Array<Sector>()

  subSectors = new Array<SubSector>()

  nodes = new Array<Node>()

  lines = new Array<Line>()

  numSides = -1
  sides = new Array<Side>()

  // BLOCKMAP
  // Created from axis aligned bounding box
  // of the map, a rectangular array of
  // blocks of size ...
  // Used to speed up collision detection
  // by spatial subdivision in 2D.
  //
  // Blockmap size.
  bMapWidth = -1
  // size in mapblocks
  bMapHeight = -1
  // int for larger maps
  blockMap: Int16Array = new Int16Array(0)
  // offsets in blockmap are from here
  blockMapLump: Int16Array = new Int16Array(0)
  // origin of block map
  bMapOrgX = -1
  bMapOrgY = -1
  blockLinks = new Array<MObj>()

  // REJECT
  // For fast sight rejection.
  // Speeds up enemy AI by skipping detailed
  //  LineOf Sight calculation.
  // Without special effect, this could be
  //  used as a PVS lookup as well.
  //
  rejectMatrix: Uint8Array = new Uint8Array(0)

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
  get rendering(): Rendering {
    return this.doom.rendering
  }
  get wad(): LumpReader {
    return this.doom.wad
  }
  get game(): Game {
    return this.doom.game
  }

  constructor(public doom: Doom) { }

  //
  // P_LoadVertexes
  //
  private loadVertexes(lump: number): void {
    // Load data into cache.
    const data = this.wad.cacheLumpNum(lump, VertexArray)
    this.vertexes = data.getVertexes()
  }

  //
  // P_LoadSegs
  //
  private loadSegs(lump: number): void {
    const data = this.wad.cacheLumpNum(lump, SegArray)
    this.segs = data.getSegs(this.vertexes, this.lines, this.sides)
  }

  //
  // P_LoadSubsectors
  //
  private loadSubSectors(lump: number): void {
    const data = this.wad.cacheLumpNum(lump, SubSectorArray)
    this.subSectors = data.getSubSectors()
  }


  //
  // P_LoadSectors
  //
  private loadSectors(lump: number): void {
    const data = this.wad.cacheLumpNum(lump, SectorArray)
    this.sectors = data.getSectors(this.rendering.data)
  }

  //
  // P_LoadNodes
  //
  private loadNodes(lump: number): void {
    const data = this.wad.cacheLumpNum(lump, NodeArray)
    this.nodes = data.getNodes()
  }

  //
  // P_LoadThings
  //
  private loadThings(lump: number) {
    const things = this.wad.cacheLumpNum(lump, ThingArray)

    let mt: MapThing
    let spawn: boolean
    for (mt of things) {
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
  // P_LoadLineDefs
  // Also counts secret lines for intermissions.
  //
  private loadLineDefs(lump: number): void {
    const data = this.wad.cacheLumpNum(lump, LineArray)
    this.lines = data.getLines(this.vertexes, this.sides)
  }

  //
  // P_LoadSideDefs
  //
  private loadSideDefs(lump: number): void {
    this.numSides = this.wad.lumpLength(lump) / MapSideDef.sizeOf
    this.sides = new Array(this.numSides)
    const data = this.wad.cacheLumpNum(lump)

    let msd: MapSideDef
    let msdPtr = 0
    for (let i = 0; i < this.numSides; ++i, msdPtr += MapSideDef.sizeOf) {
      msd = new MapSideDef(data.slice(msdPtr))

      this.sides[i] = new Side(
        msd.textureOffset << FRACBITS,
        msd.rowOffset << FRACBITS,
        this.rendering.data.textureNumForName(msd.topTexture),
        this.rendering.data.textureNumForName(msd.bottomTexture),
        this.rendering.data.textureNumForName(msd.midTexture),
        this.sectors[msd.sector],
      )
    }
  }

  //
  // P_LoadBlockMap
  //
  private loadBlockMap(lump: number): void {
    const buffer = this.wad.cacheLumpNum(lump)
    this.blockMapLump = new Int16Array(buffer)
    this.blockMap = new Int16Array(buffer, 8)

    this.bMapOrgX = this.blockMapLump[0] << FRACBITS
    this.bMapOrgY = this.blockMapLump[1] << FRACBITS
    this.bMapWidth = this.blockMapLump[2]
    this.bMapHeight = this.blockMapLump[3]

    // clear ou mobj chains
    this.blockLinks = []
  }

  //
  // P_GroupLines
  // Builds sector line lists and subsector sector numbers.
  // Finds block bounding boxes for sectors.
  //
  private groupLines(): void {
    let i: number
    // look up sector number for each subsector
    let ss: SubSector
    let ssPtr = 0
    let seg : Seg
    for (i = 0; i < this.subSectors.length; ++i, ++ssPtr) {
      ss = this.subSectors[ssPtr]
      seg = this.segs[ss.firstLine]
      ss.sector = seg.sideDef.sector
    }

    // count number of lines in each sector
    let li: Line
    let liPtr = 0
    let total = 0
    for (i = 0; i < this.lines.length; ++i, ++liPtr) {
      li = this.lines[liPtr]

      ++total
      if (li.frontSector !== null) {
        li.frontSector.lineCount++
      }

      if (li.backSector && li.backSector !== li.frontSector) {
        li.backSector.lineCount++
        ++total
      }
    }

    // build line tables for each sector
    const lineBuffer = new Array<Line>(total * 4)
    let lineBufferPtr = 0
    let sector: Sector
    let sectorPtr = 0
    let sectorLinePtr = 0
    const bbox = new BBox()

    let block: number
    for (i = 0; i < this.sectors.length; ++i, ++sectorPtr) {
      sector = this.sectors[sectorPtr]
      bbox.clear()
      // sector.lines = lineBuffer TODO
      sectorLinePtr = lineBufferPtr

      liPtr = 0
      for (let j = 0; j < this.lines.length; ++j, ++liPtr) {
        li = this.lines[liPtr]
        if (li.frontSector === sector || li.backSector === sector) {
          lineBuffer[lineBufferPtr++] = li
          bbox.add(li.v1.x, li.v1.y)
          bbox.add(li.v2.x, li.v2.y)
        }
      }
      sector.lines = lineBuffer.slice(sectorLinePtr, lineBufferPtr)
      if (lineBufferPtr - sectorLinePtr !== sector.lineCount) {
        throw 'P_GroupLines: miscounted'
      }

      // adjust bounding box to map blocks
      block = bbox.top - this.bMapOrgY + MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block >= this.bMapHeight ? this.bMapHeight-1 : block
      sector.blockBox.top = block

      block = bbox.bottom - this.bMapOrgY - MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block < 0 ? 0 : block
      sector.blockBox.bottom = block

      block = bbox.right - this.bMapOrgX + MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block >= this.bMapWidth ? this.bMapWidth-1 : block
      sector.blockBox.right = block

      block = bbox.left - this.bMapOrgX - MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block < 0 ? 0 : block
      sector.blockBox.left = block
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

    const lumpNum = this.wad.getNumForName(lumpName)

    this.tick.levelTime = 0

    // note: most of this ordering is important
    this.loadBlockMap(lumpNum + MapLumpOrder.BlockMap)
    this.loadVertexes(lumpNum + MapLumpOrder.Vertexes)
    this.loadSectors(lumpNum + MapLumpOrder.Sectors)
    this.loadSideDefs(lumpNum + MapLumpOrder.SideDefs)

    this.loadLineDefs(lumpNum + MapLumpOrder.LineDefs)
    this.loadSubSectors(lumpNum + MapLumpOrder.SSectors)
    this.loadNodes(lumpNum + MapLumpOrder.Nodes)
    this.loadSegs(lumpNum + MapLumpOrder.Segs)

    this.rejectMatrix = new Uint8Array(
      this.wad.cacheLumpNum(lumpNum + MapLumpOrder.Reject),
    )
    this.groupLines()

    this.game.bodyQueSlot = 0
    this.loadThings(lumpNum + MapLumpOrder.Things)

    // set up world state
    this.special.spawnSpecials()
  }

  //
  // P_Init
  //
  init(): void {
    this.switch.initSwitchList()
    this.special.initPicAnims()
    this.rendering.things.initSprites(sprNames)
  }
}
