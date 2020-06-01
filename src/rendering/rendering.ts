import { FRACBITS, mul } from '../misc/fixed'
import { Node, SubSector } from './defs'
import { Data } from './data'
import { Doom } from '../doom/doom'
import { NF_SUBSECTOR } from '../doom/data'
import { Play } from '../play/setup'
import { Player } from '../doom/player'
import { Sky } from './sky'
import { Wad } from '../wad/wad'

export class Rendering {

  private viewAngleOffset = -1

  private viewX = -1
  private viewY = -1
  private viewZ = -1

  private viewAngle = -1

  private viewCos = -1
  private viewSin = -1

  // bumped light from gun blasts
  private extraLight = -1

  private viewPlayer: Player | null = null

  public data = new Data(this.wad)
  public sky = new Sky()
  public get play(): Play {
    return this.doom.play
  }
  public get wad(): Wad {
    return this.doom.wad
  }
  constructor(private doom: Doom) { }

  // Blocky mode, has default, 0 = high, 1 = normal
  detailLevel = 0
  screenBlocks = 9
  // temp for screenblocks (0-9)
  screenSize = this.screenBlocks - 3


  //
  // R_PointOnSide
  // Traverse BSP (sub) tree,
  //  check point against partition plane.
  // Returns side 0 (front) or 1 (back).
  //
  private pointOnSide(x: number, y: number, node: Node): 0 | 1 {
    if (!node.dX) {
      if (x <= node.x) {
        return node.dY > 0 ? 1 : 0
      }
      return node.dY < 0 ? 1 : 0
    }
    if (!node.dY) {
      if (y <= node.y) {
        return node.dX < 0 ? 1 : 0
      }
      return node.dX > 0 ? 1 : 0
    }

    const dX = x - node.x
    const dY = y - node.y
    // Try to quickly decide by looking at sign bits.
    if ((node.dY ^ node.dX ^ dX ^ dY) & 0x80000000) {
      if ((node.dY ^ dX) & 0x80000000) {
        // (left is negative)
        return 1
      }
      return 0
    }

    const left = mul(node.dY >> FRACBITS, dX)
    const right = mul(dY, node.dX >> FRACBITS)

    if (right < left) {
      // front side
      return 0
    }
    // back side
    return 1
  }

  //
  // R_SetViewSize
  // Do not really change anything here,
  //  because it might be in the middle of a refresh.
  // The change will take effect next refresh.
  //
  setSizeNeeded = false
  private setBlocks = 0
  private setDetail = 0

  setViewSize(blocks: number, detail: number): void {
    this.setSizeNeeded = true
    this.setBlocks = blocks
    this.setDetail = detail
  }

  //
  // R_ExecuteSetViewSize
  //
  executeSetViewSize(): void {
    this.setSizeNeeded = false
  }

  async init(): Promise<void> {
    await this.data.initData()
    console.log('R_InitData')

    this.setViewSize(this.screenBlocks, this.detailLevel)

    this.sky.initSkyMap()
    console.log('R_InitSkyMap')
  }


  //
  // R_PointInSubsector
  //
  pointInSubSector(x: number, y: number): SubSector {
    // single subsector is a special case
    if (!this.play.numNodes) {
      return this.play.subSectors[0]
    }

    let node: Node
    let side: 0 | 1
    let nodeNum = this.play.numNodes - 1
    while (!(nodeNum & NF_SUBSECTOR)) {
      node = this.play.nodes[nodeNum]
      side = this.pointOnSide(x, y, node)
      nodeNum = node.children[side]
    }
    return this.play.subSectors[nodeNum & ~NF_SUBSECTOR]
  }

  //
  // R_SetupFrame
  //
  private setupFrame(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    this.viewPlayer = player
    this.viewX = player.mo.x
    this.viewY = player.mo.y
    this.viewAngle = player.mo.angle + this.viewAngleOffset
    this.extraLight = player.extraLight

    this.viewZ = player.viewZ
  }

  //
  // R_RenderView
  //
  renderPlayerView(player: Player): void {
    debugger
  }
}
