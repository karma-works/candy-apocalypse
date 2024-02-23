import { MAP_BLOCK_SHIFT, MAX_RADIUS } from '../play/local'
import { BBox } from '../misc/bbox'
import { BlockMap } from './block-map'
import { FlatArray } from '../textures/flat-array'
import { Line } from '../rendering/defs/line'
import { LineArray } from './line-array'
import { LumpReader } from '../wad/lump-reader'
import { LumpType } from '../wad/lump'
import { MObj } from '../play/mobj/mobj'
import { MapLumpOrder } from './map-lump-order'
import { NF_SUBSECTOR } from '../doom/data'
import { Node } from '../rendering/bsp/node'
import { NodeArray } from './node-array'
import { Reject } from './reject'
import { Sector } from '../rendering/defs/sector'
import { SectorArray } from './sector-array'
import { Seg } from '../rendering/segs/seg'
import { SegArray } from './seg-array'
import { Side } from '../rendering/defs/side'
import { SideArray } from './side-array'
import { Sky } from './sky'
import { SubSector } from '../rendering/defs/sub-sector'
import { SubSectorArray } from './sub-sector-array'
import { TextureArray } from '../textures/texture-array'
import { ThingArray } from './thing-array'
import { Vertex } from '../rendering/data/vertex'
import { VertexArray } from './vertex-array'

const levelRegExp = /^map(\d\d)|e(\d)m(\d)$/i

export class Level {
  static type: LumpType = 'level'
  static isType(buffer: ArrayBuffer, name: string): boolean {
    return buffer.byteLength === 0 &&
      levelRegExp.test(name)
  }

  episode = 1
  map = 1

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
  sides = new Array<Side>()

  blockMap = new BlockMap()
  blockLinks = new Array<MObj>()

  things = new ThingArray()

  // REJECT
  // For fast sight rejection.
  // Speeds up enemy AI by skipping detailed
  //  LineOf Sight calculation.
  // Without special effect, this could be
  //  used as a PVS lookup as well.
  //
  rejectMatrix: Reject = new Reject()

  sky = new Sky()

  constructor(_?: ArrayBuffer, name = '', private lump = 0) {
    if (!name) {
      return
    }

    const matches = name.match(levelRegExp)
    if (matches === null) {
      throw 'Invalid lump name for map'
    }

    const [ , m1, e2, m2 ] = matches

    if (m1 !== undefined) {
      this.map = parseInt(m1, 10)
    } else if (e2 !== undefined && m2 !== undefined) {
      this.episode = parseInt(e2, 10)
      this.map = parseInt(m2, 10)
    }
  }

  load(lumpReader: LumpReader,
    flats: FlatArray,
    textures: TextureArray,
  ): void {
    const lumpNum = this.lump
    // note: most of this ordering is important
    this.loadBlockMap(lumpReader, lumpNum + MapLumpOrder.BlockMap)
    this.loadVertexes(lumpReader, lumpNum + MapLumpOrder.Vertexes)
    this.loadSectors(lumpReader, lumpNum + MapLumpOrder.Sectors, flats)
    this.loadSideDefs(lumpReader, lumpNum + MapLumpOrder.SideDefs, textures)

    this.loadLineDefs(lumpReader, lumpNum + MapLumpOrder.LineDefs)
    this.loadSubSectors(lumpReader, lumpNum + MapLumpOrder.SSectors)
    this.loadNodes(lumpReader, lumpNum + MapLumpOrder.Nodes)
    this.loadSegs(lumpReader, lumpNum + MapLumpOrder.Segs)

    this.rejectMatrix =
      lumpReader.cacheLumpNum(lumpNum + MapLumpOrder.Reject, Reject)

    this.groupLines()

    this.loadThings(lumpReader, lumpNum + MapLumpOrder.Things)
  }


  //
  // P_LoadVertexes
  //
  private loadVertexes(lumpReader: LumpReader, lump: number): void {
    // Load data into cache.
    const data = lumpReader.cacheLumpNum(lump, VertexArray)
    this.vertexes = data.getVertexes()
  }

  //
  // P_LoadSegs
  //
  private loadSegs(lumpReader: LumpReader, lump: number): void {
    const data = lumpReader.cacheLumpNum(lump, SegArray)
    this.segs = data.getSegs(this.vertexes, this.lines, this.sides)
  }

  //
  // P_LoadSubsectors
  //
  private loadSubSectors(lumpReader: LumpReader, lump: number): void {
    const data = lumpReader.cacheLumpNum(lump, SubSectorArray)
    this.subSectors = data.getSubSectors()
  }


  //
  // P_LoadSectors
  //
  private loadSectors(lumpReader: LumpReader, lump: number, flats: FlatArray): void {
    const data = lumpReader.cacheLumpNum(lump, SectorArray)
    this.sectors = data.getSectors(flats)
  }

  //
  // P_LoadNodes
  //
  private loadNodes(lumpReader: LumpReader, lump: number): void {
    const data = lumpReader.cacheLumpNum(lump, NodeArray)
    this.nodes = data.getNodes()
  }

  //
  // P_LoadThings
  //
  private loadThings(lumpReader: LumpReader, lump: number) {
    this.things = lumpReader.cacheLumpNum(lump, ThingArray)
  }

  //
  // P_LoadLineDefs
  // Also counts secret lines for intermissions.
  //
  private loadLineDefs(lumpReader: LumpReader, lump: number): void {
    const data = lumpReader.cacheLumpNum(lump, LineArray)
    this.lines = data.getLines(this.vertexes, this.sides)
  }

  //
  // P_LoadSideDefs
  //
  private loadSideDefs(lumpReader: LumpReader, lump: number, textures: TextureArray): void {
    const data = lumpReader.cacheLumpNum(lump, SideArray)
    this.sides = data.getSides(textures, this.sectors)
  }

  //
  // P_LoadBlockMap
  //
  private loadBlockMap(lumpReader: LumpReader, lump: number): void {
    this.blockMap = lumpReader.cacheLumpNum(lump, BlockMap)

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
      seg = this.segs[ss.firstSeg]
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
      block = bbox.top - this.blockMap.originY + MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block >= this.blockMap.height ? this.blockMap.height - 1 : block
      sector.blockBox.top = block

      block = bbox.bottom - this.blockMap.originY - MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block < 0 ? 0 : block
      sector.blockBox.bottom = block

      block = bbox.right - this.blockMap.originX + MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block >= this.blockMap.width ? this.blockMap.width - 1 : block
      sector.blockBox.right = block

      block = bbox.left - this.blockMap.originX - MAX_RADIUS >> MAP_BLOCK_SHIFT
      block = block < 0 ? 0 : block
      sector.blockBox.left = block
    }
  }

  //
  // R_PointInSubsector
  //
  pointInSubSector(x: number, y: number): SubSector {
    // single subsector is a special case
    if (!this.nodes.length) {
      return this.subSectors[0]
    }

    let node: Node
    let side: 0 | 1
    let nodeNum = this.nodes.length - 1
    while (!(nodeNum & NF_SUBSECTOR)) {
      node = this.nodes[nodeNum]
      side = node.pointOnSide(x, y)
      nodeNum = node.children[side]
    }
    return this.subSectors[nodeNum & ~NF_SUBSECTOR]
  }

}
