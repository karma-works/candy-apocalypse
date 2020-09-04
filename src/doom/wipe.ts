import { Doom } from './doom'
import { Video as RVideo } from './rendering/video'
import { random } from './misc/random'

export class Wipe {

  // when zero, stop the wipe
  private go = false

  private get screenStart(): Uint8ClampedArray {
    return this.rVideo.screens[2]
  }
  private get screenEnd(): Uint8ClampedArray {
    return this.rVideo.screens[3]
  }
  private get screen(): Uint8ClampedArray {
    return this.rVideo.screens[0]
  }

  private get rVideo(): RVideo {
    return this.doom.rVideo
  }

  constructor(private doom: Doom) { }

  private shittyColMajorXForm(array: Int16Array, width: number, height: number): void {
    const dest = new Int16Array(width * height)

    let x: number
    let y: number
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        dest[x * height + y] = array[y * width + x]
      }
    }

    array.set(dest)
  }

  private y = new Array<number>()
  private initMelt(width: number, height: number): void {
    // copy start screen to main screen
    this.screen.set(this.screenStart)

    // makes this wipe faster (in theory)
    // to have stuff in column-major format
    this.shittyColMajorXForm(new Int16Array(this.screenStart.buffer), width / 2, height)
    this.shittyColMajorXForm(new Int16Array(this.screenEnd.buffer), width / 2, height)

    const y = new Array<number>(width)
    this.y = y
    y[0] = -(random.mRandom() % 16)

    let r: number
    for (let i = 1; i < width; ++i) {
      r = random.mRandom() % 3 - 1
      y[i] = y[i - 1] + r
      if (y[i] > 0) {
        y[i] = 0
      } else if (y[i] === -16) {
        y[i] = -15
      }
    }
  }
  private doMelt(width: number, height: number, tics: number): boolean {
    let i: number
    let j: number
    let dy: number
    let idx: number

    let sPtr = 0
    let dPtr = 0
    const screenStart = new Int16Array(this.screenStart.buffer)
    const screenEnd = new Int16Array(this.screenEnd.buffer)
    const screen = new Int16Array(this.screen.buffer)

    let done = true
    width = width / 2

    const y = this.y
    while (tics--) {
      for (i = 0; i < width; ++i) {
        if (y[i] < 0) {
          y[i]++
          done = false
        } else if (y[i] < height) {
          dy = y[i] < 16 ? y[i] + 1 : 8
          if (y[i] + dy >= height) {
            dy = height - y[i]
          }

          sPtr = i * height + y[i]
          dPtr = y[i] * width + i
          idx = 0
          for (j = dy; j; j--) {
            screen[dPtr + idx] = screenEnd[sPtr++]
            idx += width
          }

          y[i] += dy

          sPtr = i * height
          dPtr = y[i] * width + i
          idx = 0
          for (j = height - y[i]; j; j--) {
            screen[dPtr + idx] = screenStart[sPtr++]
            idx += width
          }

          done = false
        }
      }
    }

    return done
  }

  startScreen(): void {
    this.screenStart.set(this.rVideo.screens[0])
  }

  endScreen(x: number, y: number, width: number, height: number): void {
    this.screenEnd.set(this.rVideo.screens[0])
    // restore start scr.
    this.rVideo.drawBlock(x, y, 0, width, height, this.screenStart)
  }

  screenWipe(x: number, y: number, width: number, height: number, tics: number): boolean {
    // initial stuff
    if (!this.go) {
      this.go = true
      this.initMelt(width, height)
    }

    // do a piece of wipe-in
    const rc = this.doMelt(width, height, tics)

    // final stuff
    if (rc) {
      this.go = false
    }

    return !this.go
  }

}
