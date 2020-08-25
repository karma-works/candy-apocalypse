import { ANGLE_TO_FINE_SHIFT, fineSine } from '../misc/table'
import { FRACBITS, mul } from '../misc/fixed'
import { SfxInfo, sfxInfos } from './sounds/sfx-infos'
import { Channel } from './sounds/channel'
import { Doom } from '../doom'
import { Game } from '../game/game'
import { Sound as ISound } from '../interfaces/sound'
import { MObj } from '../play/mobj/mobj'
import { SfxName } from './sounds/sfx-name'
import { pointToAngle } from '../misc/angle'
import { random } from '../misc/random'

// when to clip out sounds
// Does not fit the large outdoor areas.
const CLIPPING_DIST = 1200 * 0x10000

// Distance tp origin when sounds should be maxed out.
// This should relate to movement clipping resolution
// (see BLOCKMAP handling).
// Originally: (200*0x10000).
const CLOSE_DIST = 160 * 0x10000

const ATTENUATOR = CLIPPING_DIST - CLOSE_DIST >> FRACBITS

const NORM_PITCH = 128
// const NORM_PRIORITY = 64
const NORM_SEP = 128

const STEREO_SWING = 96*0x10000

export class Sound {

  // the set of channels available
  private channels = new Array<Channel>()

  // These are not used, but should be (menu).
  // Maximum volume of a sound effect.
  // Internal default is max out of 0-15.
  sfxVolume = 15

  // Maximum volume of music. Useless so far.
  musicVolume = 15

  // whether songs are mus_paused
  private musicPaused = false

  // following is set
  //  by the defaults code in M_misc:
  // number of channels available
  numChannels = 3

  private get game(): Game {
    return this.doom.game
  }
  private get iSound(): ISound {
    return this.doom.iSound
  }

  constructor(private doom: Doom) { }


  //
  // Initializes sound stuff, including volume
  // Sets channels, SFX and music volume,
  //  allocates channel buffer, sets S_sfx lookup.
  //
  init(sfxVolume: number, musicVolume: number): void {
    console.log(`S_Init: default sfx volume ${sfxVolume}`)

    // Whatever these did with DMX, these are rather dummies now.
    this.iSound.setChannels()

    this.setSfxVolume(sfxVolume)
    this.setMusicVolume(musicVolume)

    // Allocating the internal channels for mixing
    // (the maximum numer of sounds rendered
    // simultaneously) within zone memory.

    this.channels = Array.from({ length: this.numChannels }, () => new Channel())

    // Free all channels for use
    for (let i = 0; i < this.numChannels; ++i) {
      this.channels[i].sfxInfo = null
    }

    // no sounds are playing, and they are not mus_paused
    this.musicPaused = false

    // Note that sounds have not been cached (yet).
    for (let i = 1; i < SfxName.NUM_SFX; ++i) {
      sfxInfos[i].lumpNum = sfxInfos[i].usefulness = -1
    }
  }

  //
  // Per level startup code.
  // Kills playing sounds at start of level,
  //  determines music if any, changes music.
  //
  start(): void {
    // kill all playing sounds at start of level
    //  (trust me - a good idea)
    for (let cNum = 0; cNum < this.numChannels; ++cNum) {
      if (this.channels[cNum].sfxInfo) {
        this.stopChannel(cNum)
      }
    }

    // TODO: music
  }

  private startSoundAtVolume(origin: MObj | null, sfxId: SfxName, volume: number): void {
    // check for bogus sound #
    if (sfxId < 1 || sfxId > SfxName.NUM_SFX) {
      throw `Bad sfx #: ${sfxId}`
    }

    const sfx = sfxInfos[sfxId]

    // Initialize sound parameters
    let sep: number
    let pitch: number
    // let priority: number
    if (sfx.link) {
      pitch = sfx.pitch
      // priority = sfx.priority
      volume += sfx.volume

      if (volume < 1) {
        return
      }
      if (volume > this.sfxVolume) {
        volume = this.sfxVolume
      }
    } else {
      pitch = NORM_PITCH
      // priority = NORM_PRIORITY
    }

    const player = this.game.player

    // Check to see if it is audible,
    //  and if not, modify the params
    if (origin && player.mo &&
      origin !== player.mo
    ) {
      const rc = this.adjustSoundParams(
        player.mo,
        origin,
        volume,
        0,
      )
      sep = rc.sep
      volume = rc.vol

      if (origin.x === player.mo.x &&
        origin.y === player.mo.y
      ) {
        sep = NORM_SEP
      }

      if (!rc.audible) {
        return
      }
    } else {
      sep = NORM_SEP
    }

    // hacks to vary the sfx pitches
    if (sfxId >= SfxName.Sawup &&
      sfxId <= SfxName.Sawhit
    ) {
      pitch += 8 - (random.mRandom() & 15)

      if (pitch < 0) {
        pitch = 0
      } else if (pitch > 255) {
        pitch = 255
      }
    } else if (sfxId !== SfxName.Itemup &&
      sfxId !== SfxName.Tink
    ) {
      pitch += 16 - (random.mRandom() & 31)

      if (pitch < 0) {
        pitch = 0
      } else if (pitch > 255) {
        pitch = 255
      }
    }

    // kill old sound
    this.stopSound(origin)

    // try to find a channel
    const cNum = this.getChannel(origin, sfx)

    if (cNum < 0) {
      return
    }

    //
    // This is supposed to handle the loading/caching.
    // For some odd reason, the caching is done nearly
    //  each time the sound is needed?
    //

    // get lumpnum if necessary
    if (sfx.lumpNum < 0) {
      sfx.lumpNum = this.iSound.getSfxLumpNum(sfx)
    }

    // increase the usefulness
    if (sfx.usefulness++ < 0) {
      sfx.usefulness = 1
    }

    // Assigns the handle to one of the channels in the
    //  mix/output buffer.
    this.channels[cNum].handle = this.iSound.startSound(sfxId,
      volume,
      sep,
      pitch,
    )
  }

  startSound(origin: MObj | null, sfxId: SfxName): void {
    this.startSoundAtVolume(origin, sfxId, this.sfxVolume)
  }

  stopSound(origin: MObj | null): void {
    for (let cNum = 0; cNum < this.numChannels; cNum++) {
      if (this.channels[cNum].sfxInfo &&
    this.channels[cNum].origin === origin
      ) {
        this.stopChannel(cNum)
        break
      }
    }
  }

  //
  // Stop and resume music, during game PAUSE.
  //
  pauseSound(): void {
    // TODO music
  }
  resumeSound(): void {
    // TODO music
  }

  //
  // Updates music & sounds
  //
  updateSounds(listener: MObj | null): void {
    let volume: number
    let sep: number
    let pitch: number
    let sfx: SfxInfo | null
    let c: Channel
    for (let cnum = 0; cnum < this.numChannels; cnum++) {
      c = this.channels[cnum]
      sfx = c.sfxInfo

      if (sfx) {
        if (this.iSound.soundIsPlaying(c.handle)) {
          // initialize parameters
          volume = this.sfxVolume
          pitch = NORM_PITCH
          sep = NORM_SEP

          if (sfx.link) {
            pitch = sfx.pitch
            volume += sfx.volume
            if (volume < 1) {
              this.stopChannel(cnum)
              continue
            } else if (volume > this.sfxVolume) {
              volume = this.sfxVolume
            }
          }

          // check non-local sounds for distance clipping
          //  or modify their params
          if (c.origin && listener &&
              listener !== c.origin) {
            const rc = this.adjustSoundParams(listener,
              c.origin,
              volume,
              sep)

            volume = rc.vol
            sep = rc.sep

            if (!rc.audible) {
              this.stopChannel(cnum)
            } else {
              this.iSound.updateSoundParams(c.handle, volume, sep, pitch)
            }
          }
        } else {
          // if channel is allocated but sound has stopped,
          //  free it
          this.stopChannel(cnum)
        }
      }
    }
  }

  setMusicVolume(volume: number): void {
    if (volume < 0 || volume > 127) {
      throw `Attempt to set music volume at ${volume}`
    }

    this.musicVolume = volume
  }

  setSfxVolume(volume: number): void {
    if (volume < 0 || volume > 127) {
      throw `Attempt to set sfx volume at ${volume}`
    }

    this.sfxVolume = volume
  }

  private stopChannel(cNum: number): void {
    const c = this.channels[cNum]

    if (c.sfxInfo) {
      // stop the sound playing
      // if (this.iSound.soundIsPlaying(c.handle)) {
      //   this.iSound.stopSound(c.handle)
      // }

      // check to see
      //  if other channels are playing the sound
      for (let i = 0; i < this.numChannels; ++i) {
        if (cNum !== i &&
          c.sfxInfo === this.channels[i].sfxInfo
        ) {
          break
        }
      }

      // degrade usefulness of sound data
      c.sfxInfo.usefulness--

      c.sfxInfo = null
    }
  }

  //
  // Changes volume, stereo-separation, and pitch variables
  //  from the norm of a sound effect to be played.
  // If the sound is not audible, returns a 0.
  // Otherwise, modifies parameters and returns 1.
  //
  private adjustSoundParams(listener: MObj, source: MObj,
    vol: number, sep: number,
  ): { audible: boolean, vol: number, sep: number } {
    const ret = { audible: false, vol, sep }

    // calculate the distance to sound origin
    //  and clip it if necessary
    const adx = Math.abs(listener.x - source.x)
    const ady = Math.abs(listener.y - source.y)

    // From _GG1_ p.428. Appox. eucledian distance fast.
    let approxDist = adx + ady - ((adx < ady ? adx : ady) >> 1)

    if (this.game.gameMap !== 8 &&
      approxDist > CLIPPING_DIST
    ) {
      return ret
    }

    // angle of source to listener
    let angle = pointToAngle(listener.x,
      listener.y,
      source.x,
      source.y)

    if (angle > listener.angle) {
      angle = angle - listener.angle >>> 0
    } else {
      angle = angle + (0xffffffff - listener.angle) >>> 0
    }

    angle >>>= ANGLE_TO_FINE_SHIFT

    // stereo separation
    ret.sep = 128 - (mul(STEREO_SWING, fineSine[angle]) >> FRACBITS)


    // volume calculation
    if (approxDist < CLOSE_DIST) {
      ret.vol = this.sfxVolume
    } else if (this.game.gameMap === 8) {
      if (approxDist > CLIPPING_DIST) {
        approxDist = CLIPPING_DIST
      }

      ret.vol = 15 + ((this.sfxVolume - 15) *
        (CLIPPING_DIST - approxDist >> FRACBITS) /
        ATTENUATOR >> 0)
    } else {

      // distance effect
      ret.vol = this.sfxVolume *
        (CLIPPING_DIST - approxDist >> FRACBITS) /
        ATTENUATOR >> 0
    }

    ret.audible = ret.vol > 0
    return ret
  }

  //
  // S_getChannel :
  //   If none available, return -1.  Otherwise channel #.
  //
  private getChannel(origin: MObj | null, sfxInfo: SfxInfo): number {
    // Find an open channel
    let cNum: number
    let c: Channel
    for (cNum = 0; cNum < this.numChannels; cNum++) {
      c = this.channels[cNum]
      if (!c.sfxInfo) {
        break
      } else if (origin && c.origin === origin) {
        this.stopChannel(cNum)
        break
      }
    }

    // None available
    if (cNum === this.numChannels) {
      // Look for lower priority
      for (cNum = 0; cNum < this.numChannels; cNum++) {
        c = this.channels[cNum]
        if (c.sfxInfo && c.sfxInfo.priority >= sfxInfo.priority) {
          break
        }
      }

      if (cNum === this.numChannels) {
        // FUCK!  No lower priority.  Sorry, Charlie.
        return -1
      } else {
        // Otherwise, kick out lower priority.
        this.stopChannel(cNum)
      }
    }

    c = this.channels[cNum]

    // channel is decided to be cnum.
    c.sfxInfo = sfxInfo
    c.origin = origin

    return cNum
  }
}
