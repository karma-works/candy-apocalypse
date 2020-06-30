import { Patch } from '../rendering/patch'

export class NumberWidget {

  // last number value
  oldNum = 0

  // user data
  data = 0

  constructor(
    // upper right-hand corner
    //  of the number (right-justified)
    public x: number,
    public y: number,

    // list of patches for 0-9
    public patches: Patch[],

    // pointer to current value
    public num: () => number,

    // pointer to boolean stating
    //  whether to update number
    public on: () => boolean,

    // max # of digits in number
    public width: number,
  ) { }
}
