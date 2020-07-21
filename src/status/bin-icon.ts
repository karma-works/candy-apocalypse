import { Patch } from '../rendering/defs/patch'

export class BinIcon {
  // last icon value
  oldVal = false

  // user data
  data = 0

  constructor(
    // center-justified location of icon
    public x: number,
    public y: number,

    // icon
    public patch: Patch,

    // pointer to current icon
    public val: () => boolean,

    // pointer to boolean
    //  stating whether to update icon
    public on: () => boolean,
  ) { }
}
