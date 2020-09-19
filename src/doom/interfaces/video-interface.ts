import { Palette } from './palette'

export interface VideoInterface {
  gamma: number
  palette: Palette

  screen: HTMLCanvasElement | null
  init(): void
  finishUpdate(): void
  quit(): void
}

export class BlankVideo implements VideoInterface {
  gamma = 0
  palette = new Palette

  screen: HTMLCanvasElement | null = null
  init(): void {
    // noop
  }
  finishUpdate(): void {
    // noop
  }
  quit(): void {
    // noop
  }
}
