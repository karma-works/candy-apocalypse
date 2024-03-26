import { Event } from '../../doom/sounds/mus';
import { MusPlayer } from './mus-player';


export abstract class AbstractChannel {
  // TODO "Raptor: Call of the Shadow" should be 70
  readonly ticRate = 140;


  constructor(protected player: MusPlayer) { }

  tics: Event[][] = [];

  tick(tic: number, time: number) {
    (this.tics[tic] || []).forEach(ev => this.handleEvent(ev, tic, time));
  }

  abstract handleEvent(ev: Event, tic: number, time: number): void;
}
