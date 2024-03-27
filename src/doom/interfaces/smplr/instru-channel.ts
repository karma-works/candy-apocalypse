import { ControllerNum, Event, EventType } from '../../doom/sounds/mus';
import { AbstractChannel } from './abstract-channel';
import { Soundfont } from 'smplr';

export class InstruChannel extends AbstractChannel<Soundfont> {
  handleEvent(ev: Event, tic: number, time: number) {
    switch (ev.event) {
    case EventType.ChangeController:
      switch (ev.num) {
      case ControllerNum.Instrument: {
        this.player.putInstrument(this.instrument)

        this.instrument = this.player.getInstrument(ev.val)
        break
      }
      case ControllerNum.Volume:
        this.instruVolume = ev.val
        this.setVolume()
        break
      default:
        // console.error(`controller event ${ev.num} not implemented`)
      }
      break
    case EventType.ReleaseNote:
      break
    case EventType.PlayNote: {
      if (!this.instrument) {
        break
      }
      const duration = this.getDuration(ev.note, tic)
      this.noteVolume = ev.vol ?? this.noteVolume

      this.instrument.start({
        note: ev.note,
        time,
        duration,
        velocity: this.noteVolume,
      })
      break
    }
    case EventType.ScoreEnd:
      return true
    default:
      // console.error(`event ${ev.event} not implemented`, ev)
    }
    return false
  }

  // Find next Release Note event to calculate the duration
  private getDuration(note: number, tic: number) {
    const predicate = (ev: Event) => ev.event === EventType.ReleaseNote && ev.note === note
    for (let i = tic; i < this.tics.length; ++i) {
      if ((this.tics[i] || []).find(predicate)) {
        return (i - tic) / this.ticRate
      }
    }

    return undefined
  }
}
