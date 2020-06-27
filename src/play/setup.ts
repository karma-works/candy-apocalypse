import { GameMode, MAX_PLAYERS, Skill } from '../global/doomdef'
import { MAP_BLOCK_SHIFT, MAX_RADIUS } from './local'
import { MapLineDef, MapLineFlag, MapLumpOrder, MapNode, MapSector, MapSeg, MapSideDef, MapSubSector, MapThing, MapVertex } from '../doom/data'
import { BBox } from '../misc/bbox'
import { Doom } from '../doom/doom'
import { Doors } from './doors'
import { FRACBITS } from '../misc/fixed'
import { Floor } from './floor'
import { Game } from '../game/game'
import { Inter } from './inter'
import { Lights } from './lights'
import { Line } from '../rendering/line'
import { MObj } from './mobj'
import { MObjHandler } from './mobj-handler'
import { Map } from './map'
import { MapUtils } from './map-utils'
import { Node } from '../rendering/node'
import { Plats } from './plats'
import { Rendering } from '../rendering/rendering'
import { Sector } from '../rendering/sector'
import { Seg } from '../rendering/seg'
import { Side } from '../rendering/side'
import { Special } from './special'
import { SubSector } from '../rendering/sub-sector'
import { Switch } from './switch'
import { Tick } from './tick'
import { User } from './user'
import { Vertex } from '../rendering/vertex'
import { Wad } from '../wad/wad'
import { sprNames } from '../doom/info'

export class Play {
  //
  // MAP related Lookup tables.
  // Store VERTEXES, LINEDEFS, SIDEDEFS, etc.
  //
  numVertexes = -1
  vertexes = new Array<Vertex>()

  numSegs = -1
  segs = new Array<Seg>()

  numSectors = -1
  sectors = new Array<Sector>()

  numSubSectors = -1
  subSectors = new Array<SubSector>()

  numNodes = -1
  nodes = new Array<Node>()

  numLines = -1
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
  private rejectMatrix: ArrayBuffer = new ArrayBuffer(0)

  public tick = new Tick(this)
  public doors = new Doors(this)
  public floor = new Floor(this)
  public inter = new Inter(this)
  public lights = new Lights(this)
  public map = new Map(this)
  public mapUtils = new MapUtils(this)
  public mObjHandler = new MObjHandler(this)
  public plats = new Plats(this)
  public special = new Special(this)
  public switch = new Switch(this)
  public user = new User(this)

  get rendering(): Rendering {
    return this.doom.rendering
  }
  get wad(): Wad {
    return this.doom.wad
  }
  get game(): Game {
    return this.doom.game
  }

  constructor(public doom: Doom) { }

  //
  // P_LoadVertexes
  //
  private async loadVertexes(lump: number): Promise<void> {
    // Determine number of lumps:
    //  total lump length / vertex record length.
    this.numVertexes = this.wad.lumpLength(lump) / MapVertex.sizeOf

    // Allocate zone memory for buffer.
    this.vertexes = new Array(this.numVertexes)

    // Load data into cache.
    const data = await this.wad.cacheLumpNum(lump)
    let ml: MapVertex
    let mlPtr = 0
    // Copy and convert vertex coordinates,
    // internal representation as fixed.
    for (let i = 0; i < this.numVertexes; ++i, mlPtr += MapVertex.sizeOf) {
      ml = new MapVertex(data.slice(mlPtr))
      this.vertexes[i] = new Vertex(
        ml.x << FRACBITS,
        ml.y << FRACBITS,
      )
    }
  }

  //
  // P_LoadSegs
  //
  private async loadSegs(lump: number): Promise<void> {
    this.numSegs = this.wad.lumpLength(lump) / MapSeg.sizeOf
    this.segs = new Array(this.numSegs)
    const data = await this.wad.cacheLumpNum(lump)

    let ml: MapSeg
    let mlIdx = 0
    let lDef: Line
    let li: Seg
    for (let i = 0; i < this.numSegs; ++i, mlIdx += MapSeg.sizeOf) {
      ml = new MapSeg(data.slice(mlIdx))
      lDef = this.lines[ml.lineDef]
      li = {
        v1: this.vertexes[ml.v1],
        v2: this.vertexes[ml.v2],
        angle: ml.angle << 16 >>> 0,
        offset: ml.offset << 16,
        lineDef: lDef,
        sideDef: this.sides[lDef.sideNum[ml.side]],
        frontSector: this.sides[lDef.sideNum[ml.side]].sector,
        backSector: null,
      }
      if (lDef.flags & MapLineFlag.TwoSided) {
        li.backSector = this.sides[lDef.sideNum[ml.side^1]].sector
      } else {
        li.backSector = null
      }
      this.segs[i] = li
    }
  }

  //
  // P_LoadSubsectors
  //
  private async loadSubSectors(lump: number): Promise<void> {
    this.numSubSectors = this.wad.lumpLength(lump) / MapSubSector.sizeOf
    this.subSectors = new Array(this.numSubSectors)
    const data = await this.wad.cacheLumpNum(lump)

    let ms: MapSubSector
    let msPtr = 0
    for (let i = 0; i < this.numSubSectors; ++i, msPtr += MapSubSector.sizeOf) {
      ms = new MapSubSector(data.slice(msPtr))
      this.subSectors[i] = {
        numLines: ms.numSegs,
        firstLine: ms.firstSeg,
        sector: null,
      }
    }
  }


  //
  // P_LoadSectors
  //
  private async loadSectors(lump: number): Promise<void> {
    this.numSectors = this.wad.lumpLength(lump) / MapSector.sizeOf
    this.sectors = new Array(this.numSectors)
    const data = await this.wad.cacheLumpNum(lump)

    let ms: MapSector
    let msPtr = 0
    for (let i = 0; i < this.numSectors; ++i, msPtr += MapSector.sizeOf) {
      ms = new MapSector(data.slice(msPtr))
      this.sectors[i] = new Sector(
        ms.floorHeight << FRACBITS,
        ms.ceilingHeight << FRACBITS,
        this.rendering.data.flatNumForName(ms.floorPic),
        this.rendering.data.flatNumForName(ms.ceilingPic),
        ms.lightLevel,
        ms.special,
        ms.tag,
        null,
      )
    }
  }

  //
  // P_LoadNodes
  //
  private async loadNodes(lump: number): Promise<void> {
    this.numNodes = this.wad.lumpLength(lump) / MapNode.sizeOf
    this.nodes = new Array(this.numNodes)
    const data = await this.wad.cacheLumpNum(lump)

    let mn: MapNode
    let mnPtr = 0
    let no: Node
    for (let i = 0; i < this.numNodes; ++i, mnPtr += MapNode.sizeOf) {
      mn = new MapNode(data.slice(mnPtr))
      no = {
        x: mn.x << FRACBITS,
        y: mn.y << FRACBITS,
        dX: mn.dX << FRACBITS,
        dY: mn.dY << FRACBITS,

        bbox: [ new BBox(), new BBox() ],
        children: new Array(2),
      }

      for (let j = 0; j < 2; ++j) {
        no.children[j] = mn.children[j]
        no.bbox[j].top = mn.bbox[j][0] << FRACBITS
        no.bbox[j].bottom = mn.bbox[j][1] << FRACBITS
        no.bbox[j].left = mn.bbox[j][2] << FRACBITS
        no.bbox[j].right = mn.bbox[j][3] << FRACBITS
      }

      this.nodes[i] = no
    }
  }

  //
  // P_LoadThings
  //
  private async loadThings(lump: number) {
    const data = await this.wad.cacheLumpNum(lump)
    const numThings = this.wad.lumpLength(lump) / MapThing.sizeOf

    let mt: MapThing
    let mtPtr = 0
    let spawn: boolean
    for (let i = 0; i < numThings; ++i, mtPtr += MapThing.sizeOf) {
      mt = new MapThing(data.slice(mtPtr))
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

      await this.mObjHandler.spawnMapThing(mt)
    }
  }

  //
  // P_LoadLineDefs
  // Also counts secret lines for intermissions.
  //
  private async loadLineDefs(lump: number): Promise<void> {
    this.numLines = this.wad.lumpLength(lump) / MapLineDef.sizeOf
    this.lines = new Array(this.numLines)
    const data = await this.wad.cacheLumpNum(lump)

    let mld: MapLineDef
    let mldPtr = 0
    let ld: Line
    let v1: Vertex, v2: Vertex
    for (let i = 0; i < this.numLines; ++i, mldPtr += MapLineDef.sizeOf) {
      mld = new MapLineDef(data.slice(mldPtr))
      v1 = this.vertexes[mld.v1]
      v2 = this.vertexes[mld.v2]
      ld = new Line(v1, v2, mld.flags, mld.special, mld.tag)

      ld.sideNum[0] = mld.sideNum[0]
      ld.sideNum[1] = mld.sideNum[1]

      if (ld.sideNum[0] !== -1) {
        ld.frontSector = this.sides[ld.sideNum[0]].sector
      } else {
        ld.frontSector = null
      }

      if (ld.sideNum[1] !== -1) {
        ld.backSector = this.sides[ld.sideNum[1]].sector
      } else {
        ld.backSector = null
      }

      this.lines[i] = ld
    }
  }

  //
  // P_LoadSideDefs
  //
  private async loadSideDefs(lump: number): Promise<void> {
    this.numSides = this.wad.lumpLength(lump) / MapSideDef.sizeOf
    this.sides = new Array(this.numSides)
    const data = await this.wad.cacheLumpNum(lump)

    let msd: MapSideDef
    let msdPtr = 0
    for (let i = 0; i < this.numSides; ++i, msdPtr += MapSideDef.sizeOf) {
      msd = new MapSideDef(data.slice(msdPtr))

      this.sides[i] = {
        textureOffset: msd.textureOffset << FRACBITS,
        rowOffset: msd.rowOffset << FRACBITS,
        topTexture: this.rendering.data.textureNumForName(msd.topTexture),
        bottomTexture: this.rendering.data.textureNumForName(msd.bottomTexture),
        midTexture: this.rendering.data.textureNumForName(msd.midTexture),
        sector: this.sectors[msd.sector],
      }
    }
  }

  //
  // P_LoadBlockMap
  //
  private async loadBlockMap(lump: number): Promise<void> {
    const buffer = await this.wad.cacheLumpNum(lump)
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
    for (i = 0; i < this.numSubSectors; ++i, ++ssPtr) {
      ss = this.subSectors[ssPtr]
      seg = this.segs[ss.firstLine]
      ss.sector = seg.sideDef.sector
    }

    // count number of lines in each sector
    let li: Line
    let liPtr = 0
    let total = 0
    for (i = 0; i < this.numLines; ++i, ++liPtr) {
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
    for (i = 0; i < this.numSectors; ++i, ++sectorPtr) {
      sector = this.sectors[sectorPtr]
      bbox.clear()
      // sector.lines = lineBuffer TODO
      sectorLinePtr = lineBufferPtr

      liPtr = 0
      for (let j = 0; j < this.numLines; ++j, ++liPtr) {
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
  async setupLevel(episode: number, map: number, playMask: number, skill: Skill): Promise<void> {
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
    this.doom.game.players[this.doom.game.consolePlayer].viewZ = 1

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
    await this.loadBlockMap(lumpNum + MapLumpOrder.BlockMap)
    await this.loadVertexes(lumpNum + MapLumpOrder.Vertexes)
    await this.loadSectors(lumpNum + MapLumpOrder.Sectors)
    await this.loadSideDefs(lumpNum + MapLumpOrder.SideDefs)

    await this.loadLineDefs(lumpNum + MapLumpOrder.LineDefs)
    await this.loadSubSectors(lumpNum + MapLumpOrder.SSectors)
    await this.loadNodes(lumpNum + MapLumpOrder.Nodes)
    await this.loadSegs(lumpNum + MapLumpOrder.Segs)

    this.rejectMatrix = await this.wad.cacheLumpNum(lumpNum + MapLumpOrder.Reject)
    this.groupLines()

    this.game.bodyQueSlot = 0
    await this.loadThings(lumpNum + MapLumpOrder.Things)

    // set up world state
    this.special.spawnSpecials()
  }

  //
  // P_Init
  //
  init(): void {
    this.switch.initSwitchList()
    this.rendering.things.initSprites(sprNames)
  }
}
