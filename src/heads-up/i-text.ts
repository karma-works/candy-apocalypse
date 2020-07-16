import { Patch } from '../rendering/patch'
import { TextLine } from './text-line'

// Input Text Line widget
//  (child of Text Line widget)
export class IText {
  // text lines to draw
  line: TextLine

  // left margin past which I am not to delete characters
  lm = 0

  // last value of *->on.
  lastOn = true

  constructor(
    x: number,
    y: number,
    font: Patch[],
    startChar: number,
    // pointer to boolean stating whether to update window
    public on: () => boolean,
  ) {
    this.line = new TextLine(x, y, font, startChar)
  }
}
