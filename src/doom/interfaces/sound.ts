import { SfxInfo, sfxInfos } from '../doom/sounds/sfx-infos'
import { Doom } from '../doom'
import { Game } from '../game/game'
import { Sfx } from '../doom/sounds/sfx'
import { Wad } from '../wad/wad'

const NUM_CHANNELS = 8

const SAMPLE_RATE = 11025

export class Sound {

  // The channel data pointers, start and end.
  private channels = new Array<Uint8Array | null>(NUM_CHANNELS).fill(null)
  private channelsBuffer = new Array<AudioBufferSourceNode | null>(NUM_CHANNELS).fill(null)

  // the channel step amount
  private channelStep = new Uint32Array(NUM_CHANNELS)

  // time that the channel started playing
  private channelStart = new Array<number>(NUM_CHANNELS).fill(0)

  // the channel handles
  private channelHandles = new Array<number>(NUM_CHANNELS).fill(0)

  // the channel left volume lookup
  private channelLeftVolLookup = new Array<Int32Array>(NUM_CHANNELS)

  // the channel right volume lookup
  private channelRightVolLookup = new Array<Int32Array>(NUM_CHANNELS)

  // sfx id of the playing sound effect
  private channelIds = new Array<Sfx>(NUM_CHANNELS).fill(0)

  private stepTable = new Int32Array(256)
  private volLookup = new Int32Array(128 * 256)

  private audioCtx: AudioContext | null = null

  private get game(): Game {
    return this.doom.game
  }
  private get wad(): Wad {
    return this.doom.wad
  }

  constructor(private doom: Doom) { }


  private getSfx(sfxName: string): Uint8Array {
    const name = `ds${sfxName}`

    let sfxLump: number
    if (this.wad.checkNumForName(name) === -1) {
      sfxLump = this.wad.getNumForName('dspistol')
    } else {
      sfxLump = this.wad.getNumForName(name)
    }

    const sfx = new Uint8Array(this.wad.cacheLumpNum(sfxLump))

    return sfx.subarray(8)
  }

  //
  // This function adds a sound to the
  //  list of currently active sounds,
  //  which is maintained as a given number
  //  (eight, usually) of internal channels.
  // Returns a handle.
  //
  private handleNums = 0
  private addSfx(sfxId: Sfx, volume: number, step: number, seperation: number): number {
    let i: number
    let oldest = this.game.gameTic
    let oldestNum = 0

    // Chainsaw troubles.
    // Play these sound effects only one at a time.
    if (sfxId === Sfx.Sawup ||
      sfxId === Sfx.Sawidl ||
      sfxId === Sfx.Sawful ||
      sfxId === Sfx.Sawhit ||
      sfxId === Sfx.Stnmov ||
      sfxId === Sfx.Pistol
    ) {
      // Loop all channels, check.
      for (i = 0; i < NUM_CHANNELS; ++i) {
        // Active, and using the same SFX?
        if (this.channels[i] &&
          this.channelIds[i] === sfxId
        ) {
          // Reset.
          this.channels[i] = null
          // We are sure that iff,
          //  there will only be one.
          break
        }
      }
    }

    // Loop all channels to find oldest SFX.
    for (i = 0; i < NUM_CHANNELS && this.channels[i]; ++i) {
      if (this.channelStart[i] < oldest) {
        oldestNum = i
        oldest = this.channelStart[i]
      }
    }

    // Tales from the cryptic.
    // If we found a channel, fine.
    // If not, we simply overwrite the first one, 0.
    // Probably only happens at startup.
    let slot: number
    if (i === NUM_CHANNELS) {
      slot = oldestNum
    } else {
      slot = i
    }

    // Okay, in the less recent channel,
    //  we will handle the new SFX.
    // Set pointer to raw data.
    this.channels[slot] = sfxInfos[sfxId].data

    // Reset current handle number, limited to 0..100.
    if (!this.handleNums) {
      this.handleNums = 100
    }

    // Assign current handle number.
    // Preserved so sounds could be stopped (unused).
    const rc = this.handleNums++
    this.channelHandles[slot] = rc

    // Set stepping???
    // Kinda getting the impression this is never used.
    this.channelStep[slot] = step
    this.channelStart[slot] = this.game.gameTic

    // Separation, that is, orientation/stereo.
    //  range is: 1 - 256
    seperation += 1

    // Per left/right channel.
    //  x^2 seperation,
    //  adjust volume properly.
    const leftVol = volume - (volume * seperation * seperation / (256 * 256) >> 0)
    seperation = seperation - 257
    const rightVol = volume - (volume * seperation * seperation / (256 * 256) >> 0)

    // sanity check
    if (rightVol < 0 || rightVol > 127) {
      throw 'rightvol out of bounds'
    }
    if (leftVol < 0 || leftVol > 127) {
      throw 'leftvol out of bounds'
    }

    // Get the proper lookup table piece
    //  for this volume level???
    this.channelLeftVolLookup[slot] = this.volLookup.slice(leftVol * 256)
    this.channelRightVolLookup[slot] = this.volLookup.slice(rightVol * 256)

    // Preserve sound SFX id,
    //  e.g. for avoiding duplicates of chainsaw.
    this.channelIds[slot] = sfxId

    return rc
  }

  //
  // SFX API
  // Note: this was called by S_Init.
  // However, whatever they did in the
  // old DPMS based DOS version, this
  // were simply dummies in the Linux
  // version.
  // See soundserver initdata().
  //
  setChannels(): void {
    for (let i = -128; i < 128; ++i) {
      this.stepTable[i + 128] = Math.pow(2, i / 64) * 65536
    }


    // generates volume lookup tables
    //  which also turn the unsigned samples
    //  into signed samples
    // for (i=0 ; i<128 ; i++)
    // for (j=0 ; j<256 ; j++)
    // vol_lookup[i*256+j] = (i*(j-128))/127;
    for (let i = 0; i < 128; i++) {
      for (let j = 0; j < 256; j++) {
        this.volLookup[i * 256 + j] = i * (j - 128) * 256 / 127
      }
    }
  }

  //
  // Retrieve the raw data lump index
  //  for a given SFX name.
  //
  getSfxLumpNum(sfx: SfxInfo): number {
    const nameBuf = `ds${sfx.name}`
    return this.wad.getNumForName(nameBuf)
  }

  //
  // Starting a sound means adding it
  //  to the current list of active sounds
  //  in the internal channels.
  // As the SFX info struct contains
  //  e.g. a pointer to the raw data,
  //  it is ignored.
  // As our sound handling does not handle
  //  priority, it is ignored.
  // Pitching (that is, increased speed of playback)
  //  is set, but currently not used by mixing.
  //
  startSound(id: Sfx, vol: number, sep: number, pitch: number): number {
    return this.addSfx(id, vol, this.stepTable[pitch], sep)
  }

  stopSound(handle: number): void {
    const chan = this.channelHandles.indexOf(handle)
    const buffer = this.channelsBuffer[chan]

    if (buffer !== null) {
      buffer.stop()
    }
    this.channels[chan] = null
    this.channelsBuffer[chan] = null
  }

  soundIsPlaying(handle: number): boolean {
    const chan = this.channelHandles.indexOf(handle)
    return this.channelsBuffer[chan] !== null
  }

  //
  // This function loops all active (internal) sound
  //  channels, retrieves a given number of samples
  //  from the raw sound data, modifies it according
  //  to the current (internal) channel parameters,
  //  mixes the per channel samples into the global
  //  mixbuffer, clamping it to the allowed range,
  //  and sets up everything for transferring the
  //  contents of the mixbuffer to the (two)
  //  hardware channels (left and right, that is).
  //
  // This function currently supports only 16bit.
  //
  updateSound(): void {
    if (this.audioCtx === null || this.audioCtx.state !== 'running') {
      return
    }

    let channel: Uint8Array | null
    let src: AudioBufferSourceNode | null
    for (let chan = 0; chan < NUM_CHANNELS; ++chan) {
      channel = this.channels[chan]
      src = this.channelsBuffer[chan]

      if (channel && src === null) {
        src = this.audioCtx.createBufferSource()
        src.connect(this.audioCtx.destination)
        this.channelsBuffer[chan] = src

        // src = this.audioCtx.createBuffer(2)
        const step = this.channelStep[chan]
        const lastStep = channel.length << 16
        const length = lastStep / step >> 0

        const buffer = this.audioCtx.createBuffer(2, length, SAMPLE_RATE)
        src.buffer = buffer
        const left = buffer.getChannelData(0)
        const right = buffer.getChannelData(1)

        let sample: number
        let dl: number
        let dr: number
        for (let i = 0, input = 0, output = 0;
          i < lastStep;
          i += step, input = i >> 16, ++output
        ) {
          sample = channel[input]
          dl = this.channelLeftVolLookup[chan][sample]
          dr = this.channelRightVolLookup[chan][sample]

          if (dl > 0x7fff) {
            dl = 1
          } else if (dl < -0x8000) {
            dl = -1
          } else {
            dl = dl / 0x7fff
          }
          if (dr > 0x7fff) {
            dr = 1
          } else if (dr < -0x8000) {
            dr = -1
          } else {
            dr = dr / 0x7fff
          }

          left[output] = dl
          right[output] = dr
        }

        src.start()

        src.onended = () => {
          this.channels[chan] = null
          this.channelsBuffer[chan] = null
        }
      }
    }
  }

  updateSoundParams(handle: number, vol: number, sep: number, pitch: number): void {
    // TODO
  }


  init(): void {
    const audioCtx = new AudioContext({
      sampleRate: SAMPLE_RATE,
    })
    document.addEventListener('click', () => {
      audioCtx.resume()
    })
    this.audioCtx = audioCtx

    let sfxInfo: SfxInfo
    for (let i = 1; i < Sfx.NUM_SFX; ++i) {
      // Alias? Example is the chaingun sound linked to pistol.
      sfxInfo = sfxInfos[i]
      if (!sfxInfo.link) {
        // Load data from WAD file.
        sfxInfo.data = this.getSfx(sfxInfo.name)
      } else {
        // Previously loaded already?
        sfxInfo.data = sfxInfo.link.data
      }
    }
  }
}
