import { Palette } from './palette'

export interface VideoInterface {
  width: number
  height: number
  gamma: number
  palette: Palette

  screen: HTMLCanvasElement | null
  init(): void
  setSize(width: number, height: number): void
  finishUpdate(): void
  quit(): void
}

export class BlankVideo implements VideoInterface {
  width = 0
  height = 0

  gamma = 0
  palette = new Palette

  screen: HTMLCanvasElement | null = null
  init(): void {
    // noop
  }
  setSize(width: number, height: number): void {
    this.width = width
    this.height = height
  }
  finishUpdate(): void {
    // noop
  }
  quit(): void {
    // noop
  }
}
