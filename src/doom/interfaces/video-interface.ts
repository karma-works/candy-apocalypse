import { Palette } from './palette'

export interface VideoInterface {
  ratio: number

  gamma: number
  palette: Palette

  screen: HTMLCanvasElement | null
  init(): void
  finishUpdate(): void
  quit(): void
}

export class BlankVideo implements VideoInterface {
  ratio = 4 / 3

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
