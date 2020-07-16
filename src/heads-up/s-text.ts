import { Patch } from '../rendering/patch'
import { TextLine } from './text-line'

// Scrolling Text window widget
//  (child of Text Line widget)
export class SText {
  // text lines to draw
  lines: TextLine[]

  // current line number
  currentLine = 0

  // last value of *->on.
  lastOn = true

  constructor(
    x: number,
    y: number,
    // height in lines
    public height: number,
    font: Patch[],
    startChar: number,
    // pointer to boolean stating whether to update window
    public on: () => boolean,
  ) {
    this.lines = Array.from({ length: height },
      (_, i) => new TextLine(x, y - i * (font[0].height + 1), font, startChar))
  }

  addLine(): void {
    // add a clear line
    if (++this.currentLine === this.height) {
      this.currentLine = 0
    }
    this.lines[this.currentLine].clear()

    // everything needs updating
    for (let i = 0; i < this.height; ++i) {
      this.lines[i].needsUpdate = 4
    }
  }

  addMessage(prefix: string, msg: string): void {
    this.addLine()
    let c: string
    if (prefix) {
      for (c of Array.from(prefix)) {
        this.lines[this.currentLine].addChar(c)
      }
    }

    for (c of Array.from(msg)) {
      this.lines[this.currentLine].addChar(c)
    }
  }
}
