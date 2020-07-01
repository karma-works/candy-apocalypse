import { AmmoType, GameMission, GameMode, GameState, KEY_DOWNARROW, KEY_LEFTARROW, KEY_PAUSE, KEY_RALT, KEY_RCTRL, KEY_RIGHTARROW, KEY_RSHIFT, KEY_UPARROW, MAX_PLAYERS, Skill, WeaponType } from '../global/doomdef'
import { ButtonCode, DEvent, EvType, GameAction } from '../doom/event'
import { Player, PlayerState, WbStart } from '../doom/player'
import { BACKUP_TICS } from '../doom/net/doom-data'
import { Doom } from '../doom/doom'
import { FRACUNIT } from '../misc/fixed'
import { HeadsUp } from '../heads-up/stuff'
import { MAX_HEALTH } from '../play/local'
import { MObjFlag } from '../play/mobj'
import { MObjType } from '../doom/info/mobj-type'
import { Net } from '../doom/net'
import { Play } from '../play/setup'
import { Rendering } from '../rendering/rendering'
import { SKY_FLAT_NAME } from '../rendering/sky'
import { StateNum } from '../doom/info/state-num'
import { StatusBar } from '../status/stuff'
import { Tick } from '../play/tick'
import { TickCmd } from '../doom/tick-cmd'
import { Win } from '../win/win'
import { getTime } from '../system/system'
import { mObjInfos } from '../doom/info/mobj-infos'
import { random } from '../misc/random'
import { states } from '../doom/info/states'

const MAX_PL_MOVE = 0x32

const SLOW_TURN_TICS = 6

const NUM_KEYS = 256

// DOOM Par Times
const pars = [
  [ 0 ],
  [ 0,30,75,120,90,165,180,180,30,165 ],
  [ 0,90,90,90,120,90,360,240,30,170 ],
  [ 0,90,45,90,150,90,90,165,30,135 ],
]

// DOOM II Par Times
const cPars = [
  //  1-10
  30,90,120,120,90,150,120,120,270,90,
  // 11-20
  210,150,150,150,210,150,420,150,210,150,
  // 21-30
  240,150,180,150,150,300,330,420,300,180,
  // 31-32
  120,30,
]


export class Game {
  gameAction = GameAction.Nothing
  gameState: GameState = -1
  gameSkill: Skill = -1
  private respawnMonsters = false
  gameEpisode = -1
  gameMap = -1

  paused = false
  // send a pause event next tic
  private sendPause = false
  // send a save event next tic
  private sendSave = false
  // ok to save / end game
  private userGame = false

  // for comparative timing purposes
  private startTime = -1

  private viewActive = false

  // only if started as net death
  deathMatch = 0
  // only true if packets are broadcast
  netGame = false
  playerInGame = new Array<boolean>(MAX_PLAYERS).fill(true)
  players = Array.from({ length: MAX_PLAYERS }, () => new Player())

  // player taking events and displaying
  consolePlayer = 0
  // view being displayed
  displayPlayer = 0
  gameTic = 0
  // gametic at level start
  private levelStartTic = 0
  // for intermission
  totalKills = 0
  totalItems = 0
  totalSecret = 0

  demoPlayback = false

  // parms for world map / intermission
  private wmInfo = new WbStart()

  private consistancy = Array.from({ length: MAX_PLAYERS },
    () => new Array<number>(BACKUP_TICS).fill(0))

  //
  // controls (have defaults)
  //
  private keyRight = KEY_RIGHTARROW
  private keyLeft = KEY_LEFTARROW

  private keyUp = KEY_UPARROW
  private keyDown = KEY_DOWNARROW
  private keyStrafeLeft = ','.charCodeAt(0)
  private keyStrafeRight = '.'.charCodeAt(0)
  private keyFire = KEY_RCTRL
  private keyUse = ' '.charCodeAt(0)
  private keyStrafe = KEY_RALT
  private keySpeed = KEY_RSHIFT

  private mouseBFire = 0
  private mouseBStrafe = 1
  private mouseBForward = 2

  private joyBFire = 0
  private joyBStrafe = 1
  private joyBUse = 3
  private joyBSpeed = 2

  private forwardMove = [ 0x19, 0x32 ]
  private sideMove = [ 0x18, 0x28 ]
  // + slow turn
  private angleTurn = [ 640, 1280, 320 ]

  private gameKeyDown = new Array<boolean>(NUM_KEYS).fill(false)
  // for accelerative turning
  private turnHeld = 0

  // allow [-1]
  private mouseButtons = new Array<boolean>(3).fill(false)

  // mouse values are used once
  private mouseX = -1
  private mouseY = -1

  private dClickTime = 0
  private dClickState = false
  private dClicks = 0

  // joystick values are repeated
  private joyXMove = -1
  private joyYMove = -1

  // allow [-1]
  private joyButtons = new Array<boolean>(4).fill(false)

  bodyQueSlot = -1

  mouseSensitivity = 5

  private get headsUp(): HeadsUp {
    return this.doom.headsUp
  }
  private get net(): Net {
    return this.doom.net
  }
  private get play(): Play {
    return this.doom.play
  }
  private get rendering(): Rendering {
    return this.doom.rendering
  }
  private get statusBar(): StatusBar {
    return this.doom.statusBar
  }
  private get tick(): Tick {
    return this.play.tick
  }
  private get win(): Win {
    return this.doom.win
  }

  constructor(private doom: Doom) { }

  //
  // G_BuildTiccmd
  // Builds a ticcmd from all of the available inputs
  // or reads it from the demo buffer.
  // If recording a demo, write it out
  //
  buildTicCmd(cmd: TickCmd): void {
    // empty, or external driver
    cmd.reset()

    cmd.consistancy = this.consistancy[this.consolePlayer][this.net.makeTic % BACKUP_TICS]

    const strafe = this.gameKeyDown[this.keyStrafe] ||
      this.mouseButtons[this.mouseBStrafe] ||
      this.joyButtons[this.joyBStrafe]

    const speed = this.gameKeyDown[this.keySpeed] ||
      this.joyButtons[this.joyBSpeed] ? 1 : 0

    let forward = 0
    let side = 0

    // use two stage accelerative turning
    // on the keyboard and joystick
    if (this.joyXMove < 0 ||
      this.joyXMove > 0 ||
      this.gameKeyDown[this.keyRight] ||
      this.gameKeyDown[this.keyLeft]
    ) {
      this.turnHeld += this.net.ticDup
    } else {
      this.turnHeld = 0
    }


    let tSpeed: number
    if (this.turnHeld < SLOW_TURN_TICS) {
      // slow turn
      tSpeed = 2
    } else {
      tSpeed = speed
    }

    // let movement keys cancel each other out
    if (strafe) {
      if (this.gameKeyDown[this.keyRight]) {
        side += this.sideMove[speed]
      }
      if (this.gameKeyDown[this.keyLeft]) {
        side -= this.sideMove[speed]
      }
      if (this.joyXMove > 0) {
        side += this.sideMove[speed]
      }
      if (this.joyXMove < 0) {
        side -= this.sideMove[speed]
      }
    } else {
      if (this.gameKeyDown[this.keyRight]) {
        cmd.angleTurn -= this.angleTurn[tSpeed]
      }
      if (this.gameKeyDown[this.keyLeft]) {
        cmd.angleTurn += this.angleTurn[tSpeed]
      }
      if (this.joyXMove > 0) {
        cmd.angleTurn -= this.angleTurn[tSpeed]
      }
      if (this.joyXMove < 0) {
        cmd.angleTurn -= this.angleTurn[tSpeed]
      }
    }

    if (this.gameKeyDown[this.keyUp]) {
      forward += this.forwardMove[speed]
    }
    if (this.gameKeyDown[this.keyDown]) {
      forward -= this.forwardMove[speed]
    }
    if (this.joyYMove < 0) {
      forward += this.forwardMove[speed]
    }
    if (this.joyYMove > 0) {
      forward -= this.forwardMove[speed]
    }
    if (this.gameKeyDown[this.keyStrafeRight]) {
      side += this.sideMove[speed]
    }
    if (this.gameKeyDown[this.keyStrafeLeft]) {
      side -= this.sideMove[speed]
    }

    // buttons
    if (this.gameKeyDown[this.keyFire] ||
      this.mouseButtons[this.mouseBFire]
    ) {
      cmd.buttons |= ButtonCode.Attack
    }

    if (this.gameKeyDown[this.keyUse]) {
      cmd.buttons |= ButtonCode.Use
      // clear double clicks if hit use button
      this.dClicks = 0
    }


    // mouse
    if (this.mouseButtons[this.mouseBForward]) {
      forward += this.forwardMove[speed]
    }

    // forward double click
    if (this.mouseButtons[this.mouseBForward] !== this.dClickState &&
      this.dClickTime > 1
    ) {
      this.dClickState = this.mouseButtons[this.mouseBForward]
      if (this.dClickState) {
        this.dClicks++
      }
      if (this.dClicks === 2) {
        cmd.buttons |= ButtonCode.Use
        this.dClicks = 0
      } else {
        this.dClickTime = 0
      }
    } else {
      this.dClickTime += this.net.ticDup
      if (this.dClickTime > 20) {
        this.dClicks = 0
        this.dClickState = false
      }
    }

    forward += this.mouseY
    if (strafe) {
      side += this.mouseX * 2
    } else {
      cmd.angleTurn -= this.mouseX * 0x8
    }

    this.mouseX = 0
    this.mouseY = 0

    if (forward > MAX_PL_MOVE) {
      forward = MAX_PL_MOVE
    } else if (forward < -MAX_PL_MOVE) {
      forward = -MAX_PL_MOVE
    }
    if (side > MAX_PL_MOVE) {
      side = MAX_PL_MOVE
    } else if (side < -MAX_PL_MOVE) {
      side = -MAX_PL_MOVE
    }

    cmd.forwardMove += forward
    cmd.sideMove += side
  }

  //
  // G_DoLoadLevel
  //
  private doLoadLevel(): void {
    // Set the sky map.
    // First thing, we have a dummy sky texture name,
    //  a flat. The data is in the WAD only because
    //  we look for an actual index, instead of simply
    //  setting one.
    const rendering = this.rendering

    rendering.sky.skyFlatNum = rendering.data.flatNumForName(SKY_FLAT_NAME)

    // DOOM determines the sky texture to be used
    // depending on the current episode, and the game version.
    const gameMode = this.doom.gameMode as unknown
    if (gameMode as GameMode === GameMode.Commercial ||
        gameMode as GameMission === GameMission.PackTNT ||
        gameMode as GameMission === GameMission.PackPlut) {
      rendering.sky.skyTexture = rendering.data.textureNumForName('SKY3')
      if (this.gameMap < 12) {
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY1')
      } else if (this.gameMap < 21) {
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY2')
      }
    }

    // for time calculation
    this.levelStartTic = this.gameTic

    if (this.doom.wipeGameState === GameState.Level) {
      // force a wipe
      this.doom.wipeGameState = -1
    }

    this.gameState = GameState.Level

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (this.playerInGame[i] &&
        this.players[i].playerState === PlayerState.Dead
      ) {
        this.players[i].playerState = PlayerState.Reborn
        this.players[i].frags.fill(0)
      }
    }

    this.play.setupLevel(this.gameEpisode, this.gameMap, 0, this.gameSkill)
    // view the guy you are playing
    this.displayPlayer = this.consolePlayer
    this.startTime = getTime()
    this.gameAction = GameAction.Nothing

    // clear cmd building stuff
    this.gameKeyDown.fill(false)
    this.joyXMove = this.joyYMove = 0
    this.mouseX = this.mouseY = 0
    this.sendPause = this.sendSave = this.paused = false
    this.mouseButtons.fill(false)
    this.joyButtons.fill(false)
  }

  //
  // G_Responder
  // Get info needed to make ticcmd_ts for the players.
  //
  responder(ev: DEvent): boolean {
    switch (ev.type) {
    case EvType.KeyDown:
      if (ev.data1 === KEY_PAUSE) {
        this.sendPause = true
        return true
      }
      if (ev.data1 < NUM_KEYS) {
        this.gameKeyDown[ev.data1] = true
      }
      // eat key down events
      return true
    case EvType.KeyUp:
      if (ev.data1 < NUM_KEYS) {
        this.gameKeyDown[ev.data1] = false
      }
      // always let key up events filter down
      return false
    case EvType.Mouse:
      this.mouseButtons[0] = !!(ev.data1 & 1)
      this.mouseButtons[1] = !!(ev.data1 & 2)
      this.mouseButtons[2] = !!(ev.data1 & 4)
      this.mouseX = ev.data2 * (this.mouseSensitivity + 5) / 10
      this.mouseY = ev.data3 * (this.mouseSensitivity + 5) / 10
      // eat events
      return true
    case EvType.Joystick:
      this.joyButtons[0] = !!(ev.data1 & 1)
      this.joyButtons[1] = !!(ev.data1 & 2)
      this.joyButtons[2] = !!(ev.data1 & 4)
      this.joyButtons[2] = !!(ev.data1 & 8)
      this.joyXMove = ev.data2
      this.joyYMove = ev.data3
      // eat events
      return true
    default:
      break
    }

    return false
  }

  //
  // G_Ticker
  // Make ticcmd_ts for the players.
  //
  ticker(): void {
    // do player reborns if needed
    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (this.playerInGame[i] && this.players[i].playerState === PlayerState.Reborn) {
        this.doReborn(i)
      }
    }

    while (this.gameAction !== GameAction.Nothing) {
      switch (this.gameAction) {
      case GameAction.NewGame:
        this.doNewGame()
        break
      case GameAction.Completed:
        this.doCompleted()
        break
      case GameAction.WorldDone:
        this.doWorldDone()
        break
      }
    }

    // get commands, check consistancy,
    // and build new consistancy check
    const buf = this.gameTic / this.net.ticDup % BACKUP_TICS

    let cmd: TickCmd
    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (this.playerInGame[i]) {
        cmd = this.players[i].cmd
        cmd.copyFrom(this.net.netCmds[i][buf])
      }
    }

    // do main actions
    switch (this.gameState) {
    case GameState.Level:
      this.tick.ticker()
      this.statusBar.ticker()
      this.headsUp.ticker()
      break
    case GameState.Intermission:
      this.win.ticker()
      break
    }
  }

  //
  // PLAYER STRUCTURE FUNCTIONS
  // also see P_SpawnPlayer in P_Things
  //

  //
  // G_InitPlayer
  // Called at the start.
  // Called by the game initialization functions.
  //
  initPlayer(player: number): void {
    // clear everthing else to default
    this.playerReborn(player)
  }

  //
  // G_PlayerFinishLevel
  // Can when a player completes a level.
  //
  private playerFinishLevel(player: number): void {
    const p = this.players[player]

    p.powers.fill(0)
    p.cards.fill(false)

    if (p.mo === null) {
      throw 'p.mo = null'
    }

    // cancel invisibility
    p.mo.flags &= ~MObjFlag.Shadow
    // cancel gun flashes
    p.extraLight = 0
    // cancel ir gogles
    p.fixedColorMap = 0
    // no palette changes
    p.damageCount = 0
    p.bonusCount = 0
  }

  //
  // G_PlayerReborn
  // Called after a player dies
  // almost everything is cleared and initialized
  //
  playerReborn(player: number): void {
    const frags = [ ...this.players[player].frags ]
    const killCount = this.players[player].killCount
    const itemCount = this.players[player].itemCount
    const secretCount = this.players[player].secretCount

    const p = this.players[player]
    p.reset()

    p.frags.splice(0, p.frags.length, ...frags)
    p.killCount = killCount
    p.itemCount = itemCount
    p.secretCount = secretCount

    // don't do anything immediately
    p.useDown = p.attackDown = true
    p.playerState = PlayerState.Live
    p.health = MAX_HEALTH
    p.readyWeapon = p.pendingWeapon = WeaponType.Pistol
    p.weaponOwned[WeaponType.Fist] = true
    p.weaponOwned[WeaponType.Pistol] = true
    p.ammo[AmmoType.Clip] = 50

    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      // p.maxAmmo[i] = maxammo[i]
    }
  }

  //
  // G_DoReborn
  //
  doReborn(playerNum: number): void {
    if (!this.netGame) {
      // reload the level from scratch
      this.gameAction = GameAction.LoadLevel
    } else {
      // respawn at the start
      // TODO
    }
  }

  //
  // G_DoCompleted
  //

  private secretExit = false
  exitLevel(): void {
    this.secretExit = false
    this.gameAction = GameAction.Completed
  }

  private doCompleted(): void {
    this.gameAction = GameAction.Nothing

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (this.playerInGame[i]) {
        // take away cards and stuff
        this.playerFinishLevel(i)
      }
    }

    if (this.doom.gameMode !== GameMode.Commercial) {
      switch (this.gameMap) {
      case 8:
        this.gameAction = GameAction.Victory
        return
      case 9:
        for (let i = 0; i < MAX_PLAYERS; ++i) {
          this.players[i].didSecret = true
        }
        break
      }
    }

    this.wmInfo.didSecret = this.players[this.consolePlayer].didSecret
    this.wmInfo.episode = this.gameEpisode - 1
    this.wmInfo.last = this.gameMap - 1

    // wminfo.next is 0 biased, unlike gamemap
    if (this.doom.gameMode === GameMode.Commercial) {
      if (this.secretExit) {
        switch (this.gameMap) {
        case 15:
          this.wmInfo.next = 30
          break
        case 31:
          this.wmInfo.next = 31
          break
        }
      } else {
        switch (this.gameMap) {
        case 31:
        case 32:
          this.wmInfo.next = 15
          break
        default:
          this.wmInfo.next = this.gameMap
          break
        }
      }
    } else {
      if (this.secretExit) {
        // go to secret level
        this.wmInfo.next = 8
      } else if (this.gameMap === 9) {
        // returning from secret level
        switch (this.gameEpisode) {
        case 1:
          this.wmInfo.next = 3
          break
        case 2:
          this.wmInfo.next = 5
          break
        case 3:
          this.wmInfo.next = 6
          break
        case 4:
          this.wmInfo.next = 2
          break
        }
      } else {
        // go to next level
        this.wmInfo.next = this.gameMap
      }
    }

    this.wmInfo.maxKills = this.totalKills
    this.wmInfo.maxItems = this.totalItems
    this.wmInfo.maxSecret = this.totalSecret
    this.wmInfo.maxFrags = 0
    if (this.doom.gameMode === GameMode.Commercial) {
      this.wmInfo.parTime = 35 * cPars[this.gameMap - 1]
    } else {
      this.wmInfo.parTime = 35 * pars[this.gameEpisode][this.gameMap]
    }
    this.wmInfo.pNum = this.consolePlayer

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      this.wmInfo.players[i].in = this.playerInGame[i]
      this.wmInfo.players[i].sKills = this.players[i].killCount
      this.wmInfo.players[i].sItems = this.players[i].itemCount
      this.wmInfo.players[i].sSecret = this.players[i].secretCount
      this.wmInfo.players[i].sTime = this.tick.levelTime
      this.wmInfo.players[i].frags = [ ...this.players[i].frags ]
    }

    this.gameState = GameState.Intermission
    this.viewActive = false

    this.win.start(this.wmInfo)
  }

  //
  // G_WorldDone
  //
  worldDone(): void {
    this.gameAction = GameAction.WorldDone

    if (this.secretExit) {
      this.players[this.consolePlayer].didSecret = true
    }

    if (this.doom.gameMode === GameMode.Commercial) {
      switch (this.gameMap) {
      case 15:
      case 31:
        if (!this.secretExit) {
          break
        }
        // fallthrough
      case 6:
      case 11:
      case 20:
      case 30:
        debugger
        break
      }
    }
  }

  private doWorldDone(): void {
    this.gameState = GameState.Level
    this.gameMap = this.wmInfo.next + 1
    this.doLoadLevel()
    this.gameAction = GameAction.Nothing
    this.viewActive = true
  }

  //
  // G_InitNew
  // Can be called by the startup code or the menu task,
  // consoleplayer, displayplayer, playeringame[] should be set.
  //
  private skill: Skill = -1
  private episode = -1
  private map = -1

  deferedInitNew(skill: Skill, episode: number, map: number): void {
    this.skill = skill
    this.episode = episode
    this.map = map
    this.gameAction = GameAction.NewGame
  }

  private doNewGame(): void {
    this.deferedInitNew(this.skill, this.episode, this.map)
    this.gameAction = GameAction.Nothing
  }

  initNew(skill: Skill, episode: number, map: number): void {
    if (this.paused) {
      this.paused = false
    }

    if (skill > Skill.Nightmare) {
      skill = Skill.Nightmare
    }

    // This was quite messy with SPECIAL and commented parts.
    // Supposedly hacks to make the latest edition work.
    // It might not work properly.
    if (episode < 1) {
      episode = 1
    }

    if (this.doom.gameMode === GameMode.Retail) {
      if (episode > 4) {
        episode = 4
      }
    } else if (this.doom.gameMode === GameMode.Shareware) {
      if (episode > 1) {
        // only start episode 1 on shareware
        episode = 1
      }
    } else {
      if (episode > 3) {
        episode = 3
      }
    }

    if (map < 1) {
      map = 1
    }

    if (map > 9 && this.doom.gameMode !== GameMode.Commercial) {
      map = 9
    }

    random.clearRandom()

    if (skill === Skill.Nightmare && this.doom.respawnParam) {
      this.respawnMonsters = true
    } else {
      this.respawnMonsters = false
    }

    if (this.doom.fastParam ||
        skill === Skill.Nightmare && this.gameSkill !== Skill.Nightmare) {
      for (let i = StateNum.SargRun1; i <= StateNum.SargPain2; ++i) {
        states[i].tics >>= 1
        mObjInfos[MObjType.Bruisershot].speed = 20 * FRACUNIT
        mObjInfos[MObjType.Headshot].speed = 20 * FRACUNIT
        mObjInfos[MObjType.Troopshot].speed = 20 * FRACUNIT
      }
    } else if (skill !== Skill.Nightmare && this.gameSkill === Skill.Nightmare) {
      for (let i = StateNum.SargRun1; i <= StateNum.SargPain2; ++i) {
        states[i].tics <<= 1
        mObjInfos[MObjType.Bruisershot].speed = 15 * FRACUNIT
        mObjInfos[MObjType.Headshot].speed = 10 * FRACUNIT
        mObjInfos[MObjType.Troopshot].speed = 10 * FRACUNIT
      }
    }

    // force players to be initialized upon first level load
    for (let i = 0; i < MAX_PLAYERS; ++i) {
      this.players[i].playerState = PlayerState.Reborn
    }

    // will be set false if a demo
    this.userGame = true
    this.paused = false
    this.demoPlayback = false
    // this.autoMapActive = false
    this.viewActive = true
    this.gameEpisode = episode
    this.gameMap = map
    this.gameSkill = skill

    this.viewActive = true

    // set the sky map for the episode
    const rendering = this.rendering
    if (this.doom.gameMode === GameMode.Commercial) {
      rendering.sky.skyTexture = rendering.data.textureNumForName('SKY3')
      if (map < 12) {
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY1')
      } else if (map < 21) {
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY2')
      }
    } else {
      switch (episode) {
      case 1:
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY1')
        break
      case 2:
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY2')
        break
      case 3:
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY3')
        break
      case 4:
        // Special Edition sky
        rendering.sky.skyTexture = rendering.data.textureNumForName('SKY4')
        break
      }
    }

    this.doLoadLevel()
  }
}
