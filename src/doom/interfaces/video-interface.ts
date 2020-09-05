import { Palette } from './palette'

export interface VideoInterface {
  useGamma: number
  uploadNewPalette(palette: Palette): void

  screen: HTMLCanvasElement | null
  init(screen: HTMLCanvasElement): void
  finishUpdate(): void
  quit(): void
}
