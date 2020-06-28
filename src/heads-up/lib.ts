import { Draw } from '../rendering/draw'
import { HeadsUp } from './stuff'
import { SCREENWIDTH } from '../global/doomdef'
import { SText } from './s-text'
import { TextLine } from './text-line'
import { Video } from '../rendering/video'

// background and foreground screen numbers
// different from other modules.
const FG = 0

const SP = ' '.charCodeAt(0)
const US = '_'.charCodeAt(0)

export class Lib {
  private get draw(): Draw {
    return this.headsUp.doom.rendering.draw
  }
  private get video(): Video {
    return this.headsUp.doom.rendering.video
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

        this.video.drawPatchDirect(x, l.y, FG, l.font[c - l.startChar])
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
      this.video.drawPatchDirect(x, l.y, FG, l.font[US - l.startChar])
    }
  }


  // sorta called by HU_Erase and just better darn get things straight
  eraseTextLine(l: TextLine): void {

    // Only erases when NOT in automap and the screen is reduced,
    // and the text must either need updating or refreshing
    // (because of a recent change back from the automap)
    if (this.draw.viewWindowX && l.needsUpdate) {
      const lh = l.font[0].height + 1
      for (let y = l.y, yOffset = y * SCREENWIDTH;
        y < l.y + lh;
        ++y, yOffset += SCREENWIDTH
      ) {
        if (y < this.draw.viewWindowY ||
          y >= this.draw.viewWindowY + this.draw.viewHeight
        ) {
          // erase entire line
          this.draw.videoErase(yOffset, SCREENWIDTH)
        } else {
          // erase left border
          this.draw.videoErase(yOffset, this.draw.viewWindowX)
          // erase right border
          this.draw.videoErase(
            yOffset + this.draw.viewWindowX + this.draw.viewWidth,
            this.draw.viewWindowX,
          )
        }
      }
    }

    if (l.needsUpdate) {
      --l.needsUpdate
    }
  }

  drawSText(s: SText): void {
    if (!s.on.messageOn) {
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
      if (s.lastOn && !s.on.messageOn) {
        s.lines[i].needsUpdate = 4
      }
      this.eraseTextLine(s.lines[i])
    }

    s.lastOn = s.on.messageOn
  }
}
