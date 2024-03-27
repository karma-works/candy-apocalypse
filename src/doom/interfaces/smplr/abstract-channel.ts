import { DrumMachine, Soundfont } from 'smplr';
import { Event } from '../../doom/sounds/mus';
import { MusPlayer } from './mus-player';

type Instrument = Soundfont | DrumMachine

export abstract class AbstractChannel<T extends Instrument> {
  // TODO "Raptor: Call of the Shadow" should be 70
  readonly ticRate = 140;

  protected instrument?: T;

  protected noteVolume = 100
  protected instruVolume = 100
  protected volume = 64

  constructor(protected player: MusPlayer) { }

  tics: Event[][] = [];

  // Returns true on score end
  tick(tic: number, time: number): boolean {
    let scoreEnd = false;
    (this.tics[tic] || []).forEach(ev => {
      scoreEnd = this.handleEvent(ev, tic, time) || scoreEnd
    });
    return scoreEnd
  }

  // Returns true on score end
  abstract handleEvent(ev: Event, tic: number, time: number): boolean;

  setVolume(vol: number = this.volume): void {
    this.volume = vol
    this.instrument?.output.setVolume(this.instruVolume * (this.volume / 127))
  }
}
