import { ControllerNum, Event, EventType } from '../../doom/sounds/mus';
import { AbstractChannel } from './abstract-channel';
import { DrumMachine } from 'smplr';
import { percussionMap } from './instruments';

export class DrumChannel extends AbstractChannel {
  private instrument?: DrumMachine;

  private noteVolume = 100

  handleEvent(ev: Event, _tic: number, time: number) {
    switch (ev.event) {
    case EventType.ChangeController:
      switch (ev.num) {
      case ControllerNum.Instrument: {
        this.instrument = this.player.getDrum()
        break
      }
      case ControllerNum.Volume:
        this.instrument?.output.setVolume(ev.val)
        break
      default:
        // console.error(`controller event ${ev.num} not implemented`)
      }
      break
    case EventType.PlayNote: {
      if (!this.instrument) {
        break
      }
      this.noteVolume = ev.vol ?? this.noteVolume

      if (ev.note < 35 || ev.note > 81) {
        break
      }

      this.instrument.start({
        note: percussionMap[ev.note],
        time,
        velocity: this.noteVolume,
      })
      break
    }
    default:
      // console.error(`event ${ev.event} not implemented`)
    }
  }
}
