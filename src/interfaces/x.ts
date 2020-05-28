export const enum XColorFlags {
  DoRed = 0x1,
  DoGreen = 0x2,
  DoBlue = 0x4,
}

export interface XColor {
  // pixel value
  pixel: number

  // rgb values
  red: number
  green: number
  blue: number

  flags: number

  pad: number
}

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
  display.addEventListener('keydown', ev => list.push(ev))
  display.addEventListener('keyup', ev => list.push(ev))
  display.addEventListener('mousedown', ev => list.push(ev))
  display.addEventListener('mouseup', ev => list.push(ev))
  display.addEventListener('mousemove', ev => list.push(ev))
}
