import { Button1, Button1Mask, Button2, Button2Mask, Button3, Button3Mask, XListenEvent, XNextEvent, XPending, XQuitEvent } from './events'
import { Color, Palette } from './palette'
import { DEvent, EvType } from '../doom/event'
import { SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { Doom } from '../doom'
import { Video as RVideo } from '../rendering/video'
import { ScanCode } from './scancodes'

export class Video {
  useGamma = 0

  private screen: HTMLCanvasElement | null = null
  private xScreen: CanvasRenderingContext2D | null = null

  private image: ImageData | null = null
  private xWidth = 0
  private xHeight = 0

  // Blocky mode,
  // replace each 320x200 pixel with multiply*multiply pixels.
  // According to Dave Taylor, it still is a bonehead thing
  // to use ....
  private multiply = 1

  useMouse = true
  useJoystick = false

  private get rVideo(): RVideo {
    return this.doom.rendering.video
  }

  constructor(private doom: Doom) {
    this.uploadNewPalette()
  }

  getEvent(): void {
    if (this.screen === null) {
      return
    }
    // put event-grabbing stuff in here
    const xEvent = XNextEvent(this.screen)
    const keyEvent = xEvent as KeyboardEvent
    const mouseEvent = xEvent as MouseEvent
    const event: DEvent = {
      type: -1, data1: -1, data2: -2, data3: -1,
    }
    switch (xEvent.type) {
    case 'keydown':
      event.type = EvType.KeyDown
      this.populateKeyEvent(event, keyEvent)

      this.doom.postEvent(event)
      break
    case 'keyup':
      event.type = EvType.KeyUp
      this.populateKeyEvent(event, keyEvent)

      this.doom.postEvent(event)
      break
    case 'mousedown':
      event.type = EvType.Mouse
      event.data1 =
          (mouseEvent.buttons & Button1Mask ? 1 : 0) |
          (mouseEvent.buttons & Button2Mask ? 2 : 0) |
          (mouseEvent.buttons & Button3Mask ? 4 : 0) |
          (mouseEvent.button === Button1 ? 1 : 0) |
          (mouseEvent.button === Button2 ? 2 : 0) |
          (mouseEvent.button === Button3 ? 4 : 0)
      event.data2 = event.data3 = 0
      this.doom.postEvent(event)
      break

    case 'mouseup':
      event.type = EvType.Mouse
      event.data1 =
          (mouseEvent.buttons & Button1Mask ? 1 : 0) |
          (mouseEvent.buttons & Button2Mask ? 2 : 0) |
          (mouseEvent.buttons & Button3Mask ? 4 : 0)
      // suggest parentheses around arithmetic in operand of |
      event.data1 = event.data1 ^
          (mouseEvent.button === Button1 ? 1 : 0) ^
          (mouseEvent.button === Button2 ? 2 : 0) ^
          (mouseEvent.button === Button3 ? 4 : 0)
      event.data2 = event.data3 = 0
      this.doom.postEvent(event)
      break

    case 'mousemove':
      event.type = EvType.Mouse

      event.data1 =
      (mouseEvent.buttons & Button1Mask ? 1 : 0) |
      (mouseEvent.buttons & Button2Mask ? 2 : 0) |
      (mouseEvent.buttons & Button3Mask ? 4 : 0)

      event.data2 = mouseEvent.movementX << 2
      event.data3 = -mouseEvent.movementY << 2

      if (event.data2 || event.data3) {
        if (mouseEvent.offsetX !== this.xWidth / 2 &&
            mouseEvent.offsetY !== this.xHeight / 2
        ) {
          this.doom.postEvent(event)
        }
      }

      break
    }
  }

  private populateKeyEvent(event: DEvent, keyEvent: KeyboardEvent) {
    event.data1 = ScanCode[keyEvent.code as keyof typeof ScanCode]
    if (event.data1 === ScanCode.ShiftLeft) {
      event.data1 = ScanCode.ShiftRight
    }
    if (keyEvent.key.length === 1) {
      event.data2 = keyEvent.key.charCodeAt(0)
    }
  }

  //
  // I_StartTic
  //
  startTic(): void {
    if (this.screen === null) {
      return
    }

    while (XPending(this.screen)) {
      this.getEvent()
    }
  }

  //
  // I_FinishUpdate
  //
  finishUpdate(): void {
    if (this.xScreen === null || this.image === null) {
      return
    }

    // scales the screen size before blitting it
    if (this.multiply === 1) {
      const oLine = this.image.data
      const iLine = new Uint8ClampedArray(this.rVideo.screens[0].buffer)

      let oLinePtr = 0
      let iLinePtr = 0
      let x: number
      let y = SCREENHEIGHT

      const reds = this.reds
      const greens = this.greens
      const blues = this.blues
      while (y--) {
        x = SCREENWIDTH
        do {
          oLine[oLinePtr++] = reds[iLine[iLinePtr]]
          oLine[oLinePtr++] = greens[iLine[iLinePtr]]
          oLine[oLinePtr++] = blues[iLine[iLinePtr]]
          oLine[oLinePtr++] = 255
          iLinePtr++
        // eslint-disable-next-line no-cond-assign
        } while (x -= 1)
      }
    }

    this.xScreen.putImageData(this.image, 0, 0)
  }

  private palette = new Palette()
  private reds = new Uint8ClampedArray()
  private greens = new Uint8ClampedArray()
  private blues = new Uint8ClampedArray()

  uploadNewPalette(palette: Palette = this.palette): void {
    this.reds = palette.getColors(Color.Red, this.useGamma)
    this.greens = palette.getColors(Color.Green, this.useGamma)
    this.blues = palette.getColors(Color.Blue, this.useGamma)
    this.palette = palette
  }

  private firstTime = 1

  initGraphics(screen: HTMLCanvasElement): void {
    if (!this.firstTime) {
      return
    }
    this.firstTime = 0

    this.xWidth = SCREENWIDTH * this.multiply
    this.xHeight = SCREENHEIGHT * this.multiply

    this.screen = screen

    this.screen.width = this.xWidth
    this.screen.height = this.xHeight


    this.xScreen = this.screen.getContext('2d')

    if (this.xScreen === null) {
      throw 'Could not open display'
    }

    XListenEvent(this.screen, this.useMouse)

    this.image = this.xScreen.createImageData(this.xWidth, this.xHeight)

    this.rVideo.screens[0] = new Uint8ClampedArray(SCREENWIDTH * SCREENHEIGHT)
  }

  quit(): void {
    if (this.screen === null || this.xScreen === null) {
      return
    }

    this.xScreen.clearRect(0, 0, SCREENWIDTH, SCREENHEIGHT)

    XQuitEvent(this.screen)

    this.screen = null
    this.xScreen = null
  }
}
