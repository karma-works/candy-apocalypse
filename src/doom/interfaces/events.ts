export type XEvent = KeyboardEvent | MouseEvent

export const Button1Mask = 0x1
export const Button2Mask = 0x2
export const Button3Mask = 0x4

export const Button1 = 1
export const Button2 = 3
export const Button3 = 2

const pending = new Map<HTMLCanvasElement, XEvent[]>()
export function XPending(display: HTMLCanvasElement): number {
  const list = pending.get(display)
  return list === void 0 ? 0 : list.length
}

export function XNextEvent(display: HTMLCanvasElement): XEvent | never {
  let list: XEvent[] | undefined
  for (;;) {
    list = pending.get(display)
    if (list !== undefined && list.length > 0) {
      return list.shift() as XEvent
    }
  }
}

export function XListenEvent(display: HTMLCanvasElement): void {
  const list = new Array<XEvent>()
  pending.set(display, list)
  display.tabIndex = 0

  display.addEventListener('contextmenu', ev => ev.preventDefault())

  const listener = (ev: XEvent): void => {
    list.push(ev) && ev.preventDefault()
  }

  display.addEventListener('focus', () => {
    // Delay to avoid triggering event while focusing
    setTimeout(() => {
      display.addEventListener('keydown', listener)
      display.addEventListener('keyup', listener)
      display.addEventListener('mousedown', listener)
      display.addEventListener('mouseup', listener)
      display.addEventListener('mousemove', listener)
    }, 0)

    display.requestPointerLock()
  })
  display.addEventListener('blur', () => {
    display.removeEventListener('keydown', listener)
    display.removeEventListener('keyup', listener)
    display.removeEventListener('mousedown', listener)
    display.removeEventListener('mouseup', listener)
    display.removeEventListener('mousemove', listener)
  })

}
