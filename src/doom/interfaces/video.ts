import { Button1, Button1Mask, Button2, Button2Mask, Button3, Button3Mask, XListenEvent, XNextEvent, XPending } from './events'
import { DEvent, EvType } from '../doom/event'
import { KEY_BACKSPACE, KEY_DOWNARROW, KEY_ENTER, KEY_EQUALS, KEY_ESCAPE, KEY_F1, KEY_F10, KEY_F11, KEY_F12, KEY_F2, KEY_F3, KEY_F4, KEY_F5, KEY_F6, KEY_F7, KEY_F8, KEY_F9, KEY_LEFTARROW, KEY_MINUS, KEY_PAUSE, KEY_RALT, KEY_RCTRL, KEY_RIGHTARROW, KEY_RSHIFT, KEY_TAB, KEY_UPARROW, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { Doom } from '../doom'
import { Palette } from './palette'
import { Video as RVideo } from '../rendering/video'

function xlateKey({ code, key }: KeyboardEvent): number {
  let rc: number
  switch (code) {
  case 'ArrowLeft': rc = KEY_LEFTARROW; break
  case 'ArrowRight': rc = KEY_RIGHTARROW; break
  case 'ArrowDown': rc = KEY_DOWNARROW; break
  case 'ArrowUp': rc = KEY_UPARROW; break
  case 'Escape': rc = KEY_ESCAPE; break
  case 'Enter': rc = KEY_ENTER; break
  case 'Tab': rc = KEY_TAB; break
  case 'F1': rc = KEY_F1; break
  case 'F2': rc = KEY_F2; break
  case 'F3': rc = KEY_F3; break
  case 'F4': rc = KEY_F4; break
  case 'F5': rc = KEY_F5; break
  case 'F6': rc = KEY_F6; break
  case 'F7': rc = KEY_F7; break
  case 'F8': rc = KEY_F8; break
  case 'F9': rc = KEY_F9; break
  case 'F10': rc = KEY_F10; break
  case 'F11': rc = KEY_F11; break
  case 'F12': rc = KEY_F12; break

  case 'Backspace':
  case 'Delete': rc = KEY_BACKSPACE; break

  case 'Pause': rc = KEY_PAUSE; break

  case 'Equal': rc = KEY_EQUALS; break

  case 'Minus': rc = KEY_MINUS; break

  case 'ShiftLeft':
  case 'ShiftRight':
    rc = KEY_RSHIFT
    break

  case 'ControlLeft':
  case 'ControlRight':
    rc = KEY_RCTRL
    break

  case 'AltLeft':
  case 'MetaLeft':
  case 'OSLeft':
  case 'AltRight':
  case 'MetaRight':
  case 'OSRight':
    rc = KEY_RALT
    break
  default:
    rc = key.toLowerCase().charCodeAt(0)
  }
  return rc
}

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

  private get rVideo(): RVideo {
    return this.doom.rendering.video
  }

  constructor(private doom: Doom) { }

  private lastMouseX = 0
  private lastMouseY = 0
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
      event.data1 = xlateKey(keyEvent)
      this.doom.postEvent(event)
      break
    case 'keyup':
      event.type = EvType.KeyUp
      event.data1 = xlateKey(keyEvent)
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
      event.data2 = mouseEvent.offsetX - this.lastMouseX << 2
      event.data3 = this.lastMouseY - mouseEvent.offsetY << 2

      if (event.data2 || event.data3) {
        this.lastMouseX = mouseEvent.offsetX
        this.lastMouseY = mouseEvent.offsetY
        if (mouseEvent.offsetX !== this.xWidth / 2 &&
            mouseEvent.offsetY !== this.xHeight / 2
        ) {
          this.doom.postEvent(event)
        }
      }

      break
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
      const palette = this.palette
      while (y--) {
        x = SCREENWIDTH
        do {
          oLine.set(
            palette.get(iLine[iLinePtr++], this.useGamma),
            oLinePtr,
          )

          oLinePtr += 4
        // eslint-disable-next-line no-cond-assign
        } while (x -= 1)
      }
    }

    this.xScreen.putImageData(this.image, 0, 0)
  }

  palette = new Palette()

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

    XListenEvent(this.screen)

    this.image = this.xScreen.createImageData(this.xWidth, this.xHeight)

    this.rVideo.screens[0] = new Uint8ClampedArray(SCREENWIDTH * SCREENHEIGHT)
  }
}
