import { Player } from '../doom/player'

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
