import { AmmoType, Card, GameMission, GameMode, GameState, MAX_PLAYERS, PowerType, Skill, WeaponType } from '../global/doomdef'
import { MObjType, StateNum, mObjInfo, states } from '../doom/info'
import { PSpriteDef, PSpriteNum } from '../play/sprite'
import { Player, PlayerState } from '../doom/player'
import { Doom } from '../doom/doom'
import { FRACUNIT } from '../misc/fixed'
import { GameAction } from '../doom/event'
import { Play } from '../play/setup'
import { Rendering } from '../rendering/rendering'
import { SKY_FLAT_NAME } from '../rendering/sky'
import { getTime } from '../system/system'
import { random } from '../misc/random'

const NUM_KEYS = 256

export class Game {
  gameAction = GameAction.Nothing
  gameState: GameState = -1
  gameSkill: Skill = -1
  private respawnMonsters = false
  private gameEpisode = -1
  private gameMap = -1

  private paused = false
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
  playerInGame = new Array<boolean>(MAX_PLAYERS).fill(false)
  players = Array.from({ length: MAX_PLAYERS }, () => <Player> {
    mo: null,
    playerState: -1,
    cmd: {
      forwardMove: -1,
      sideMove: -1,
      angleTurn: -1,
      consistancy: -1,
      chatChar: -1,
      buttons: -1,
    },
    viewZ: -1,
    viewHeight: -1,
    deltaViewHeight: -1,
    bob: -1,
    health: -1,
    armorPoints: -1,
    armorType: -1,
    powers: new Array(PowerType.NUMPOWERS).fill(-1),
    cards: new Array(Card.NUMCARDS).fill(false),
    backpack: false,
    frags: new Array(MAX_PLAYERS).fill(-1),
    readyWeapon: -1,
    pendingWeapon: -1,
    weaponOwned: new Array(WeaponType.NUMWEAPONS).fill(false),
    ammo: new Array(AmmoType.NUMAMMO).fill(-1),
    maxAmmo: new Array(AmmoType.NUMAMMO).fill(-1),
    attackDown: -1,
    useDown: -1,
    cheats: -1,
    refire: -1,
    killCount: -1,
    itemCount: -1,
    secretCount: -1,
    message: '',
    damageCount: -1,
    bonusCount: -1,
    attacker: null,
    extraLight: -1,
    fixedColorMap: -1,
    colorMap: -1,
    pSprites: Array.from({ length: PSpriteNum.NUMPSPRITES }, () => <PSpriteDef> {
      state: null,
      tics: -1,
      sX: -1,
      sY: -1,
    }),
    didSecret: false,
  })

  // player taking events and displaying
  consolePlayer = 0
  // view being displayed
  displayPlayer = 0
  gametic = 0
  // gametic at level start
  private levelStartTic = 0
  // for intermission
  totalKills = 0
  totalItems = 0
  totalSecret = 0

  private demoPlayback = false

  private gameKeyDown = new Array<boolean>(NUM_KEYS).fill(false)

  // allow [-1]
  private mouseButtons = new Array<false>(3).fill(false)

  // mouse values are used once
  private mouseX = -1
  private mouseY = -1

  // joystick values are repeated
  private joyXMove = -1
  private joyYMove = -1

  // allow [-1]
  private joyButtons = new Array<false>(4).fill(false)

  mouseSensitivity = 5

  constructor(private doom: Doom,
              private rendering: Rendering,
              private play: Play) { }

  //
  // G_DoLoadLevel
  //
  private async doLoadLevel(): Promise<void> {
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
    this.levelStartTic = this.gametic

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

    await this.play.setupLevel(this.gameEpisode, this.gameMap, 0, this.gameSkill)
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
  // G_Ticker
  // Make ticcmd_ts for the players.
  //
  ticker(): void {
    while (this.gameAction !== GameAction.Nothing) {
      switch (this.gameAction) {
      case GameAction.NewGame:
        this.doNewGame()
        break
      }
    }
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

  async initNew(skill: Skill, episode: number, map: number): Promise<void> {
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
        mObjInfo[MObjType.Bruisershot].speed = 20 * FRACUNIT
        mObjInfo[MObjType.Headshot].speed = 20 * FRACUNIT
        mObjInfo[MObjType.Troopshot].speed = 20 * FRACUNIT
      }
    } else if (skill !== Skill.Nightmare && this.gameSkill === Skill.Nightmare) {
      for (let i = StateNum.SargRun1; i <= StateNum.SargPain2; ++i) {
        states[i].tics <<= 1
        mObjInfo[MObjType.Bruisershot].speed = 15 * FRACUNIT
        mObjInfo[MObjType.Headshot].speed = 10 * FRACUNIT
        mObjInfo[MObjType.Troopshot].speed = 10 * FRACUNIT
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

    await this.doLoadLevel()
  }
}
