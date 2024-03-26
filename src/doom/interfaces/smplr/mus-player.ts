import { CHANNELS, DRUM_CHANNEL, Mus } from '../../doom/sounds/mus';
import { CacheStorage, DrumMachine, Soundfont } from 'smplr';
import { DrumChannel } from './drum-channel';
import { InstruChannel } from './instru-channel';
import { instrumentMap } from './instruments';

export class MusPlayer {
  // TODO "Raptor: Call of the Shadow" should be 70
  readonly ticRate = 140

  private loaded = false
  private playing = false

  private currentTic = 0
  private currentTime = 0

  private readonly channels = Array.from({ length: CHANNELS }, (_, ch) =>
    ch === DRUM_CHANNEL ? new DrumChannel(this) : new InstruChannel(this))
  private preloadedInstruments: { [k: number]: Soundfont } = []
  private drum?: DrumMachine
  private cache = new CacheStorage()

  constructor(
    public audioCtx: AudioContext,
    private mus: Mus,
  ) {}

  async load() {
    if (this.loaded) {
      return
    }
    const { instruments } = this.mus

    let hasDrum = false
    for (let i = 0; i < instruments.length; ++i) {
      const num = instruments[i]
      if (num >= 0 && num <= 127) {
        const instru = await this.getInstrument(num).load
        this.putInstrument(instru)
      } else if (num >= 135 && num <= 181) {
        hasDrum = true
      }
    }
    if (hasDrum) {
      await this.getDrum().load
    }

    const tics = this.mus.byTicsByChannel()
    tics.forEach((tics, ch) => {
      this.channels[ch].tics = tics
    })

    this.loaded = true
  }

  getInstrument(num: number) {
    let instru = this.preloadedInstruments[num]
    if (instru) {
      delete this.preloadedInstruments[num]
      return instru
    }

    const instrument = instrumentMap[num]
    instru = new Soundfont(this.audioCtx, { instrument, storage: this.cache });

    return instru
  }
  putInstrument(instru?: Soundfont) {
    if (!instru?.config.instrument) {
      return
    }
    const num = instrumentMap.indexOf(instru.config.instrument)
    this.preloadedInstruments[num] = instru
  }
  getDrum() {
    if (this.drum) {
      return this.drum
    }
    return this.drum = new DrumMachine(this.audioCtx, { storage: this.cache })
  }

  private ticker() {
    if (!this.loaded || !this.playing) {
      return
    }

    // Avoid stacking too many notes in the queue if too late
    if (this.audioCtx.currentTime - this.currentTime > 0) {
      this.currentTime = this.audioCtx.currentTime
    }

    while (this.currentTime < this.audioCtx.currentTime + 0.5) {
      this.tick()
    }

    setTimeout(this.ticker.bind(this), 250)
  }

  private tick() {
    this.channels.forEach((ch) => ch.tick(this.currentTic, this.currentTime))

    this.currentTic++
    this.currentTime += 1 / this.ticRate
  }

  async play() {
    this.playing = true
    await this.load()

    this.currentTic = 0
    this.currentTime = this.audioCtx.currentTime

    this.ticker()
  }

  stop() {
    this.playing = false
  }

}


