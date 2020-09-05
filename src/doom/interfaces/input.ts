import { Button1, Button1Mask, Button2, Button2Mask, Button3, Button3Mask, XListenEvent, XNextEvent, XPending, XQuitEvent } from './events'
import { DEvent, EvType } from '../doom/event'
import { ScanCode } from './scancodes'

export class Input {
  screen: HTMLElement | null = null

  useMouse = true
  useJoystick = false

  postEvent: (ev: DEvent) => void = () => ({})

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

      this.postEvent(event)
      break
    case 'keyup':
      event.type = EvType.KeyUp
      this.populateKeyEvent(event, keyEvent)

      this.postEvent(event)
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
      this.postEvent(event)
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
      this.postEvent(event)
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
        this.postEvent(event)
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

  private firstTime = true

  init(screen: HTMLElement): void {
    if (!this.firstTime) {
      return
    }
    this.firstTime = false

    this.screen = screen

    XListenEvent(this.screen, this.useMouse)
  }

  quit(): void {
    if (this.screen === null) {
      return
    }

    XQuitEvent(this.screen)
  }
}
