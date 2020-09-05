import { HU_FONTSIZE, HU_FONTSTART, HeadsUp } from './stuff'
import { AutoMap } from '../auto-map/auto-map'
import { IText } from './i-text'
import { RenderingInterface } from '../rendering/rendering-interface'
import { SCREENWIDTH } from '../global/doomdef'
import { SText } from './s-text'
import { TextLine } from './text-line'
import { Video } from '../rendering/video'
import { toupper } from '../utils/c'

// background and foreground screen numbers
// different from other modules.
const FG = 0

const SP = ' '.charCodeAt(0)
const US = '_'.charCodeAt(0)

export class Lib {
  private get autoMap(): AutoMap {
    return this.headsUp.autoMap
  }
  private get rendering(): RenderingInterface {
    return this.headsUp.doom.rendering
  }
  private get rVideo(): Video {
    return this.headsUp.doom.rVideo
  }

  constructor(private headsUp: HeadsUp) { }

  drawTextLine(l: TextLine, drawCursor: boolean): void {
    // draw the new stuff
    let w: number
    let x = l.x
    let c: number
    for (let i = 0; i < l.line.length; ++i) {
      c = l.line.charAt(i).toUpperCase().charCodeAt(0)

      if (c !== SP &&
        c >= l.startChar &&
        c <= US
      ) {
        w = l.font[c - l.startChar].width
        if (x + w > SCREENWIDTH) {
          break
        }

        this.rVideo.drawPatch(x, l.y, FG, l.font[c - l.startChar])
        x += w
      } else {
        x += 4
        if (x >= SCREENWIDTH) {
          break
        }
      }
    }

    // draw the cursor if requested
    if (drawCursor &&
      x + l.font[US - l.startChar].width <= SCREENWIDTH
    ) {
      this.rVideo.drawPatch(x, l.y, FG, l.font[US - l.startChar])
    }
  }


  // sorta called by HU_Erase and just better darn get things straight
  private lastAutoMapActive = true
  eraseTextLine(l: TextLine): void {

    // Only erases when NOT in automap and the screen is reduced,
    // and the text must either need updating or refreshing
    // (because of a recent change back from the automap)
    if (!this.autoMap.active &&
      this.rendering.viewWindowX && l.needsUpdate
    ) {
      const lh = l.font[0].height + 1
      for (let y = l.y, yOffset = y * SCREENWIDTH;
        y < l.y + lh;
        ++y, yOffset += SCREENWIDTH
      ) {
        if (y < this.rendering.viewWindowY ||
          y >= this.rendering.viewWindowY + this.rendering.viewHeight
        ) {
          // erase entire line
          this.rVideo.erase(yOffset, SCREENWIDTH)
        } else {
          // erase left border
          this.rVideo.erase(yOffset, this.rendering.viewWindowX)
          // erase right border
          this.rVideo.erase(
            yOffset + this.rendering.viewWindowX + this.rendering.viewWidth,
            this.rendering.viewWindowX,
          )
        }
      }
    }

    this.lastAutoMapActive = this.autoMap.active
    if (l.needsUpdate) {
      --l.needsUpdate
    }
  }

  drawSText(s: SText): void {
    if (!s.on()) {
      // if not on, don't draw
      return
    }

    // draw everything
    let idx: number
    let l: TextLine
    for (let i = 0; i < s.height; ++i) {
      idx = s.currentLine - i
      if (idx < 0) {
        // handle queue of lines
        idx += s.height
      }
      l = s.lines[idx]

      // need a decision made here on whether to skip the draw
      // no cursor, please
      this.drawTextLine(l, false)
    }
  }

  eraseSText(s: SText): void {
    for (let i = 0; i < s.height; ++i) {
      if (s.lastOn && !s.on()) {
        s.lines[i].needsUpdate = 4
      }
      this.eraseTextLine(s.lines[i])
    }

    s.lastOn = s.on()
  }

  drawIText(it: IText): void {
    if (!it.on()) {
      return
    }
    // draw the line w/ cursor
    this.drawTextLine(it.line, true)
  }
  eraseIText(it: IText): void {
    if (it.lastOn && !it.on()) {
      it.line.needsUpdate = 4
    }
    this.eraseTextLine(it.line)
    it.lastOn = it.on()
  }

  //
  // Find string width from hu_font chars
  //
  stringWidth(str: string): number {
    let w = 0
    let c: number
    for (let i = 0; i < str.length; ++i) {
      c = toupper(str.charCodeAt(i)) - HU_FONTSTART
      if (c < 0 || c >= HU_FONTSIZE) {
        w += 4
      } else {
        w += this.headsUp.font[i].width
      }
    }

    return w
  }

  //
  // Find string height from hu_font chars
  //
  stringHeight(str: string): number {
    let h = 0
    const height = this.headsUp.font[0].height
    for (let i = 0; i < str.length; ++i) {
      if (str.charAt(i) === '\n') {
        h += height
      }
    }
    return h
  }

  //
  // Write a string using the hu_font
  //
  writeText(x: number, y: number, str: string, lineHeight = 12): void {
    let w: number
    let ch = 0
    let c: number

    let cx = x
    let cy = y

    for (;;) {
      c = str.charCodeAt(ch++)
      if (!c) {
        break
      }
      if (c === '\n'.charCodeAt(0)) {
        cx = x
        cy += lineHeight
        continue
      }

      c = toupper(c) - HU_FONTSTART
      if (c < 0 || c >= HU_FONTSIZE) {
        cx += 4
        continue
      }

      w = this.headsUp.font[c].width
      if (cx + w > SCREENWIDTH) {
        break
      }

      this.rVideo.drawPatch(cx, cy, 0, this.headsUp.font[c])

      cx += w
    }
  }
}
