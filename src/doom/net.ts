import { BACKUP_TICS, DoomData } from './net/doom-data'
import { ButtonCode } from './event'
import { Doom } from './doom'
import { DoomCom } from './net/doom-com'
import { Game } from '../game/game'
import { Net as INet } from '../interfaces/net'
import { MAX_PLAYERS } from '../global/doomdef'
import { Menu } from '../menu/menu'
import { TickCmd } from './tick-cmd'
import { Video } from '../interfaces/video'
import { getTime } from '../system/system'

const NCMD_EXIT = 0x80000000
const NCMD_RETRANSMIT = 0x40000000
const NCMD_SETUP = 0x20000000
const NCMD_KILL = 0x10000000

//
// NETWORKING
//
// gametic is the tic about to (or currently being) run
// maketic is the tick that hasn't had control made for it yet
// nettics[] has the maketics for all players
//
// a gametic cannot be run until nettics[] > gametic for all players
//
// bit flag in doomdata->player
const RESEND_COUNT = 10
const PL_DRONE = 0x80

//
// Network play related stuff.
// There is a data struct that stores network
//  communication related stuff, and another
//  one that defines the actual packets to
//  be transmitted.
//
export const DOOMCOM_ID = 0x12345678

// Max computers/players in a game.
const MAX_NET_NODES = 8

export class Net {
  doomCom = new DoomCom()
  // points inside doomcom
  netBuffer = new DoomData()

  private localCmds = Array.from({ length: BACKUP_TICS }, () => new TickCmd())

  netCmds = Array.from({ length: MAX_PLAYERS }, () =>
    Array.from({ length: BACKUP_TICS }, () => new TickCmd()))
  private netTics = new Array<number>(MAX_NET_NODES).fill(0)
  // set false as nodes leave game
  private nodeInGame = new Array<boolean>(MAX_NET_NODES).fill(false)
  // set when local needs tics
  private remoteResend = new Array<boolean>(MAX_NET_NODES).fill(false)
  // set when remote needs tics
  private resendTo = new Array<number>(MAX_NET_NODES).fill(0)
  private resendCount = new Array<number>(MAX_NET_NODES).fill(0)

  private nodeForPlayer = new Array<number>(MAX_PLAYERS).fill(0)

  makeTic = 0
  private skipTics = 0
  ticDup = 1
  private maxSend = 0

  private reboundPacket = false
  private reboundStore = new DoomData()

  private get game(): Game {
    return this.doom.game
  }
  private get iNet(): INet {
    return this.doom.iNet
  }
  private get iVideo(): Video {
    return this.doom.iVideo
  }
  private get menu(): Menu {
    return this.doom.menu
  }
  constructor(private doom: Doom) { }

  private expandTics(low: number): number {
    const delta = low - (this.makeTic & 0xff)

    if (delta >= -64 && delta <= 64) {
      return (this.makeTic & ~0xff) + low
    }
    if (delta > 64) {
      return (this.makeTic & ~0xff) - 256 + low
    }
    if (delta < -64) {
      return (this.makeTic & ~0xff) + 256 + low
    }

    throw `ExpandTics: strange value ${low} at maketic ${this.makeTic}`
  }

  //
  // HSendPacket
  //
  private sendPacket(node: number, flags: number): void {
    this.netBuffer.checksum = 0 | flags

    if (!node) {
      this.reboundStore.copyFrom(this.netBuffer)
      this.reboundPacket = true
      return
    }

    debugger
  }

  //
  // HGetPacket
  // Returns false if no packet is waiting
  //
  private getPacket(): boolean {
    if (this.reboundPacket) {
      this.netBuffer.copyFrom(this.reboundStore)
      this.doomCom.remoteNode = 0
      this.reboundPacket = false
      return true
    }

    if (!this.game.netGame) {
      return false
    }

    if (this.game.demoPlayback) {
      return false
    }

    debugger
    return false
  }

  //
  // GetPackets
  //
  private getPackets(): void {
    let netConsole: number
    let netNode: number
    let start: number
    let src: TickCmd
    let dest: TickCmd
    let realEnd: number
    let realStart: number
    while (this.getPacket()) {
      if (this.netBuffer.checksum & NCMD_SETUP) {
        // extra setup packet
        continue
      }

      netConsole = this.netBuffer.player & ~PL_DRONE
      netNode = this.doomCom.remoteNode

      // to save bytes, only the low byte of tic numbers are sent
      // Figure out what the rest of the bytes are
      realStart = this.expandTics(this.netBuffer.startTic)
      realEnd = realStart + this.netBuffer.numTics

      // check for exiting the game
      if (this.netBuffer.checksum & NCMD_EXIT) {
        debugger
      }

      // check for a remote game kill
      if (this.netBuffer.checksum & NCMD_KILL) {
        throw 'Killed by network driver'
      }

      this.nodeForPlayer[netConsole] = netNode

      // check for retransmit request
      if (this.resendCount[netNode] <= 0 &&
        this.netBuffer.checksum & NCMD_RETRANSMIT
      ) {
        this.resendTo[netNode] = this.expandTics(this.netBuffer.retransmitFrom)
        this.resendCount[netNode] = RESEND_COUNT
      } else {
        this.resendCount[netNode]--
      }

      // check for out of order / duplicated packet
      if (realEnd === this.netTics[netNode]) {
        continue
      }

      if (realEnd < this.netTics[netNode]) {
        debugger
      }

      // check for a missed packet
      if (realStart > this.netTics[netNode]) {
        // stop processing until the other system resends the missed tics
        this.remoteResend[netNode] = true
        continue
      }

      // update command store from the packet
      this.remoteResend[netNode] = false

      start = this.netTics[netNode] - realStart
      src = this.netBuffer.cmds[start]

      while (this.netTics[netNode] < realEnd) {
        dest = this.netCmds[netConsole][this.netTics[netNode] % BACKUP_TICS]
        this.netTics[netNode]++
        dest.copyFrom(src)
        start++
        src = this.netBuffer.cmds[start]
      }
    }
  }

  //
  // NetUpdate
  // Builds ticcmds for console player,
  // sends out a packet
  //
  private gameTime = 0
  async netUpdate(): Promise<void> {
    // check time
    const nowTime = getTime() / this.ticDup >> 0
    let newTics = nowTime - this.gameTime
    this.gameTime = nowTime

    // nothing new to update
    if (newTics <= 0) {
      return this.netUpdateGoToListen()
    }

    if (this.skipTics <= newTics) {
      newTics -= this.skipTics
      this.skipTics = 0
    } else {
      this.skipTics -= newTics
      newTics = 0
    }

    this.netBuffer.player = this.game.consolePlayer

    // build new ticcmds for console player
    const gameTicDiv = this.game.gameTic / this.ticDup >> 0
    for (let i = 0; i < newTics; ++i) {
      this.iVideo.startTic()
      await this.doom.processEvents()

      if (this.makeTic - gameTicDiv >= BACKUP_TICS / 2 - 1) {
        // can't hold any more
        break
      }

      this.game.buildTicCmd(this.localCmds[this.makeTic % BACKUP_TICS])
      this.makeTic++
    }

    if (this.doom.singleTics) {
      // singletic update is syncronous
      return
    }

    // send the packet to the other nodes
    let realStart: number
    for (let i = 0; i < this.doomCom.numNodes; ++i) {
      if (this.nodeInGame[i]) {
        this.netBuffer.startTic = realStart = this.resendTo[i]
        this.netBuffer.numTics = this.makeTic - realStart
        if (this.netBuffer.numTics > BACKUP_TICS) {
          throw 'NetUpdate: netbuffer->numtics > BACKUPTICS'
        }

        this.resendTo[i] = this.makeTic - this.doomCom.extraTics

        for (let j = 0; j < this.netBuffer.numTics; ++j) {
          this.netBuffer.cmds[j].copyFrom(this.localCmds[(realStart + j) % BACKUP_TICS])
        }

        if (this.remoteResend[i]) {
          this.netBuffer.retransmitFrom = this.netTics[i]
          this.sendPacket(i, NCMD_RETRANSMIT)
        } else {
          this.netBuffer.retransmitFrom = 0
          this.sendPacket(i, 0)
        }
      }
    }

    this.netUpdateGoToListen()
  }
  private netUpdateGoToListen(): void {
    this.getPackets()
  }

  checkNetGame(): void {
    for (let i = 0; i < MAX_NET_NODES; ++i) {
      this.nodeInGame[i] = false
      this.netTics[i] = 0
      // set when local needs tics
      this.remoteResend[i] = false
      // which tic to start sending
      this.resendTo[i] = 0
    }

    // I_InitNetwork sets doomcom and netgame
    this.iNet.initNetwork()
    if (this.doomCom.id !== DOOMCOM_ID
    ) {
      throw 'Doomcom buffer invalid!'
    }

    this.netBuffer = this.doomCom.data
    this.game.consolePlayer = this.game.displayPlayer =
      this.doomCom.consolePlayer

    if (this.game.netGame) {
      debugger
    }

    console.log(`startskill ${this.doom.startSkill}  deathmatch: ${this.game.deathMatch}  startmap: ${this.doom.startMap}  startepisode: ${this.doom.startEpisode}`)

    // read values out of doomcom
    this.ticDup = this.doomCom.ticDup
    this.maxSend = (BACKUP_TICS / (2 * this.ticDup) >> 0) - 1
    if (this.maxSend < 1) {
      this.maxSend = 1
    }

    for (let i = 0; i < this.doomCom.numPlayers; ++i) {
      this.game.playerInGame[i] = true
    }
    for (let i = 0; i < this.doomCom.numNodes; ++i) {
      this.nodeInGame[i] = true
    }

    console.log(`player ${this.game.consolePlayer + 1} of ${this.doomCom.numPlayers} (${this.doomCom.numNodes} nodes)`)
  }

  //
  // TryRunTics
  //
  private frameOn = 0
  private frameSkip = [ false, false, false, false ]
  private oldNetTics = 0

  private oldEnterTics = 0
  async tryRunTics(): Promise<void> {
    // get real tics
    const enterTic = getTime() / this.ticDup
    const realTics = enterTic - this.oldEnterTics
    this.oldEnterTics = enterTic

    // get available tics
    await this.netUpdate()

    let lowTic = 2147483647

    let i: number
    for (i = 0; i < this.doomCom.numNodes; ++i) {
      if (this.nodeInGame[i]) {
        if (this.netTics[i] < lowTic) {
          lowTic = this.netTics[i]
        }
      }
    }

    const availableTics = lowTic - this.game.gameTic / this.ticDup >> 0

    let counts: number
    // decide how many tics to run
    if (realTics < availableTics - 1) {
      counts = realTics + 1
    } else if (realTics < availableTics) {
      counts = realTics
    } else {
      counts = availableTics
    }

    if (counts < 1) {
      counts = 1
    }

    this.frameOn++

    if (!this.game.demoPlayback) {
      // ideally nettics[0] should be 1 - 3 tics above lowtic
      // if we are consistantly slower, speed up time
      for (i = 0; i < MAX_PLAYERS; ++i) {
        if (this.game.playerInGame[i]) {
          break
        }
      }

      if (this.game.consolePlayer === i) {
        // the key player does not adapt
      } else {
        if (this.netTics[0] <= this.netTics[this.nodeForPlayer[i]]) {
          this.gameTime--
        }

        this.frameSkip[this.frameOn & 3] =
            this.oldNetTics > this.netTics[this.nodeForPlayer[i]]
        this.oldNetTics = this.netTics[0]

        if (this.frameSkip[0] && this.frameSkip[1] &&
          this.frameSkip[2] && this.frameSkip[4]
        ) {
          this.skipTics = 1
        }
      }
    }

    // wait for new tics if needed
    while (lowTic < (this.game.gameTic / this.ticDup >> 0) + counts) {
      await this.netUpdate()
      lowTic = 2147483647

      for (i = 0; i < this.doomCom.numNodes; ++i) {
        if (this.nodeInGame[i] && this.netTics[i] < lowTic) {
          lowTic = this.netTics[i]
        }
      }

      if (lowTic < this.game.gameTic / this.ticDup >> 0) {
        throw 'TryRunTics: lowtic < gametic'
      }

      // don't stay in here forever -- give the menu a chance to work
      if ((getTime() / this.ticDup >> 0) - enterTic >= 20) {
        this.menu.ticker()
        return
      }
    }

    // run the count * ticdup dics
    while (counts--) {
      for (i = 0; i < this.ticDup; ++i) {
        if (this.game.gameTic / this.ticDup >> 0 > lowTic) {
          throw 'gametic>lowtic'
        }

        if (this.doom.advancedemo) {
          this.doom.doAdvanceDemo()
        }
        this.menu.ticker()
        await this.game.ticker()
        this.game.gameTic++

        // modify command for duplicated tics
        if (i !== this.ticDup - 1) {
          const buf = this.game.gameTic / this.ticDup % BACKUP_TICS

          let cmd: TickCmd
          for (let j = 0; j < MAX_PLAYERS; ++j) {
            cmd = this.netCmds[j][buf]
            cmd.chatChar = 0
            if (cmd.buttons & ButtonCode.Special) {
              cmd.buttons = 0
            }
          }
        }
      }

      // check for new console commands
      await this.netUpdate()
    }
  }
}
