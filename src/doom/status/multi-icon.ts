import { Patch } from '../rendering/defs/patch'

export class MultiIcon {
  // last icon number
  oldINum = -1

  // user data
  data = 0

  constructor(
    // center-justified location of icons
    public x: number,
    public y: number,

    // list of icons
    public patches: Patch[],

    // pointer to current icon
    public iNum: () => number,

    // pointer to boolean stating
    //  whether to update icon
    public on: () => boolean,

  ) { }
}
