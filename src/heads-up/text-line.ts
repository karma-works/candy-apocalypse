import { Patch } from '../rendering/patch'

const MAX_LINE_LENGTH = 80

// Text Line widget
//  (parent of Scrolling Text and Input Text widgets)
export class TextLine {
  // line of text
  line = ''

  // whether this line needs to be udpated
  needsUpdate = 0

  constructor(
    // left-justified position of scrolling text window
    public x: number,
    public y: number,

    // font
    public font: Patch[],

    // start character
    public startChar: number,
  ) { }

  clear(): void {
    this.line = ''
    this.needsUpdate = 1
  }

  addChar(ch: string): boolean {
    if (this.line.length === MAX_LINE_LENGTH) {
      return false
    } else {
      this.line += ch
      this.needsUpdate = 4
      return true
    }
  }

}
