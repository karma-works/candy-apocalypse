export type XEvent = KeyboardEvent | MouseEvent

export const Button1Mask = 0x1
export const Button2Mask = 0x2
export const Button3Mask = 0x4

export const Button1 = 1
export const Button2 = 3
export const Button3 = 2

interface ScreenListener {
  pending: XEvent[],
  listeners: {
    [K in keyof HTMLElementEventMap]?: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any
  },
}
const listeners = new Map<HTMLCanvasElement, ScreenListener>()

export function XPending(display: HTMLCanvasElement): number {
  const l = listeners.get(display)
  return l === void 0 ? 0 : l.pending.length
}

export function XNextEvent(display: HTMLCanvasElement): XEvent | never {
  for (;;) {
    const l = listeners.get(display)
    if (l !== undefined && l.pending.length > 0) {
      return l.pending.shift() as XEvent
    }
  }
}

export function XListenEvent(display: HTMLCanvasElement): void {
  const l: ScreenListener = { pending: [], listeners: {} }
  const pending = l.pending
  listeners.set(display, l)
  display.tabIndex = 0

  const preventDefault = (ev: Event) => ev.preventDefault()
  const listener = (ev: XEvent): void => {
    pending.push(ev) && ev.preventDefault()
  }

  display.addEventListener('contextmenu', preventDefault)
  l.listeners.contextmenu = preventDefault

  const onFocus = () => {
    // Delay to avoid triggering event while focusing
    setTimeout(() => {
      display.addEventListener('keydown', listener)
      l.listeners.keydown = listener
      display.addEventListener('keyup', listener)
      l.listeners.keyup = listener
      display.addEventListener('mousedown', listener)
      l.listeners.mousedown = listener
      display.addEventListener('mouseup', listener)
      l.listeners.mouseup = listener
      display.addEventListener('mousemove', listener)
      l.listeners.mousemove = listener
    }, 0)

    display.requestPointerLock()
  }
  const onBlur = () => {
    display.removeEventListener('keydown', listener)
    delete l.listeners.keydown
    display.removeEventListener('keyup', listener)
    delete l.listeners.keyup
    display.removeEventListener('mousedown', listener)
    delete l.listeners.mousedown
    display.removeEventListener('mouseup', listener)
    delete l.listeners.mouseup
    display.removeEventListener('mousemove', listener)
    delete l.listeners.mousemove
  }

  display.addEventListener('focus', onFocus)
  l.listeners.focus = onFocus
  display.addEventListener('blur', onBlur)
  l.listeners.blur = onBlur
}

export function XQuitEvent(display: HTMLCanvasElement): void {
  if (document.pointerLockElement === display) {
    document.exitPointerLock()
  }
  if (document.fullscreenElement === display.parentElement) {
    document.exitFullscreen()
  }

  const l = listeners.get(display)
  if (l === undefined) {
    return
  }

  l.pending = [];
  // eslint-disable-next-line no-extra-parens
  (Object.keys(l.listeners) as (keyof HTMLElementEventMap)[])
    .forEach(k => {
      display.removeEventListener(k, l.listeners[k] as never)
    })
}
