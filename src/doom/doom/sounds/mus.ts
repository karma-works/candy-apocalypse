import { LumpType } from '../../wad/lump'
import { tostring } from '../../utils/c'

export const CHANNELS = 16
export const DRUM_CHANNEL = 15

export const enum EventType {
  ChannelMask = 0b1111 << 0,
  EventMask = 0b111 << 4,
  LastMask = 0b1 << 7,
  ValMask = 0b01111111,
  ReleaseNote = 0 << 4,
  PlayNote = 1 << 4,
  PitchWheel = 2 << 4,
  SystemEvent = 3 << 4,
  ChangeController = 4 << 4,
  ScoreEnd = 6 << 4,
}

export const enum SystemEventType {
  AllSoundsOff = 10,
  AllNotesOff = 11,
  Mono = 12,
  Poly = 13,
  ResetAllControllers = 14,
}

export const enum ControllerNum {
  Instrument = 0,
  Bank = 1,
  Modulation = 2,
  Volume = 3,
  Pan = 4,
  Expression = 5,
  Reverb = 6,
  Chorus = 7,
  Substain = 8,
  SoftPedal = 9,
}

export type Event = { channel: number, time: number } & (
  { event: EventType.ReleaseNote, note: number } |
  { event: EventType.PlayNote, note: number, vol?: number } |
  { event: EventType.PitchWheel, val: number } |
  { event: EventType.SystemEvent, type: SystemEventType } |
  { event: EventType.ChangeController, num: ControllerNum, val: number } |
  { event: EventType.ScoreEnd })

export class Mus {
  static type: LumpType = 'mus'
  static isType(buffer: ArrayBuffer): boolean {
    try {
      // identifier "MUS" 0x1A
      const prefix = tostring(buffer, 0, 4)
      return prefix === 'MUS\x1A'
    } catch (e) {
      return false
    }
  }

  primChannels: number
  secChannels: number
  events: Event[]
  instruments: number[]

  constructor(buffer: ArrayBuffer) {
    const header = new Uint16Array(buffer, 0, 8)
    // identifier "MUS" 0x1A
    let length = header[2]
    const start = header[3]
    this.primChannels = header[4]
    this.secChannels = header[5]
    const instruCount = header[6]
    // const dummy = header[7]

    this.instruments = Array.from(new Int16Array(buffer,
      8 * header.BYTES_PER_ELEMENT,
      instruCount))

    const rawEvents = new Uint8Array(buffer, start)
    length = Math.min(rawEvents.length, length)

    const events: Event[] = []
    for (let i = 0; i < length; ++i) {
      const channel = rawEvents[i] & EventType.ChannelMask
      const event = rawEvents[i] & EventType.EventMask
      let last = !!(rawEvents[i] & EventType.LastMask)

      let time = 0

      switch (event) {
      case EventType.ReleaseNote: {
        const note = rawEvents[++i] & EventType.ValMask
        events.push({ event, channel, time, note })
        break
      }
      case EventType.PlayNote: {
        const hasVol = rawEvents[++i] & EventType.LastMask
        const note = rawEvents[i] & EventType.ValMask
        const vol = hasVol ? rawEvents[++i] & EventType.ValMask : undefined
        events.push({ event, channel, time, note, vol })
        break
      }
      case EventType.PitchWheel: {
        const val = rawEvents[++i]
        events.push({ event, channel, time, val })
        break
      }
      case EventType.SystemEvent: {
        const type = rawEvents[++i] & EventType.ValMask
        events.push({ event, channel, time, type })
        break
      }
      case EventType.ChangeController: {
        const num = rawEvents[++i] & EventType.ValMask
        const val = rawEvents[++i] & EventType.ValMask
        events.push({ event, channel, time, num, val })
        break
      }
      case EventType.ScoreEnd: {
        events.push({ event, channel, time })
        break
      }
      }

      while (last) {
        events[events.length - 1].time = time *= 128
        events[events.length - 1].time = time += rawEvents[++i] & EventType.ValMask

        last = !!(rawEvents[i] & EventType.LastMask)
      }
    }

    this.events = events
  }

  byTicsByChannel() {
    const tics = Array.from({ length: CHANNELS }, _ => [] as Event[][])
    let tic = 0

    this.events.forEach(e => {
      if (tics[e.channel][tic] === undefined) {
        tics[e.channel][tic] = []
      }
      tics[e.channel][tic].push(e)
      tic += e.time
    })

    return tics
  }
}
