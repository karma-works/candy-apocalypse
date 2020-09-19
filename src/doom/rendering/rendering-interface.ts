import { Player } from '../doom/player'

export const enum RenderingMode {
  Legacy,
  WebGL,
}

export interface RenderingInterface {
  readonly fullScreen: boolean
  readonly viewWindowX: number
  readonly viewWindowY: number
  readonly viewWidth: number
  readonly viewHeight: number

  setSizeNeeded: boolean
  executeSetViewSize(): void

  highDetails: boolean
  screenSize: number

  renderPlayerView(pl: Player): void

  fillBackScreen(): void
  drawViewBorder(): void

  init(): void
}

export class BlankRenderer implements RenderingInterface {
  readonly fullScreen = false
  readonly viewWindowX = 0
  readonly viewWindowY = 0
  readonly viewWidth = 0
  readonly viewHeight = 0

  setSizeNeeded = false
  executeSetViewSize(): void {
    // noop
  }

  highDetails = false
  screenSize = 6

  renderPlayerView(): void {
    // noop
  }

  fillBackScreen(): void {
    // noop
  }
  drawViewBorder(): void {
    // noop
  }

  init(): void {
    // noop
  }
}
