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
