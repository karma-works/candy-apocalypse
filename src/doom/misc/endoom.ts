const CHAR_PER_LINE = 80
const LINES = 25

const FONT_HEIGHT = 40

const SCREENHEIGHT = FONT_HEIGHT * LINES

const colors = [
  '#000000',
  '#0000a8',
  '#00a800',
  '#00a8a8',
  '#a80000',
  '#a800a8',
  '#a85400',
  '#a8a8a8',
  '#545454',
  '#5454fe',
  '#54fe54',
  '#54fefe',
  '#fe5454',
  '#fe54fe',
  '#fefe54',
  '#fefefe',
]

// from 0x80
const extendedASCII = [
  'Ç', 'ü', 'é', 'â', 'ä', 'à', 'å', 'ç', 'ê', 'ë', 'è', 'ï', 'î', 'ì', 'Ä', 'Å',
  'É', 'æ', 'Æ', 'ô', 'ö', 'ò', 'û', 'ù', 'ÿ', 'Ö', 'Ü', 'ø', '£', 'Ø', '×', 'ƒ',
  'á', 'í', 'ó', 'ú', 'ñ', 'Ñ', 'ª', 'º', '¿', '®', '¬', '½', '¼', '¡', '«', '»',
  '░', '▒', '▓', '│', '┤', 'Á', 'Â', 'À', '©', '╣', '║', '╗', '╝', '¢', '¥', '┐',
  '└', '┴', '┬', '├', '─', '┼', 'ã', 'Ã', '╚', '╔', '╩', '╦', '╠', '═', '╬', '¤',
  'ð', 'Ð', 'Ê', 'Ë', 'È', 'ı', 'Í', 'Î', 'Ï', '┘', '┌', '█', '▄', '¦', 'Ì', '▀',
  'Ó', 'ß', 'Ô', 'Ò', 'õ', 'Õ', 'µ', 'þ', 'Þ', 'Ú', 'Û', 'Ù', 'ý', 'Ý', '¯', '´',
  '≡', '±', '‗', '¾', '¶', '§', '÷', '¸', '°', '¨', '·', '¹', '³', '²', '■', ' ',
]

export function displayEndoom(
  buffer: ArrayBuffer,
  canvas: HTMLCanvasElement,
): void {
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    return
  }
  ctx.font = `${FONT_HEIGHT}px monospace`
  ctx.textBaseline = 'top'
  const charSize = ctx.measureText('█')

  const FONT_WIDTH = Math.floor(charSize.width)
  const SCREENWIDTH = FONT_WIDTH * CHAR_PER_LINE

  canvas.width = SCREENWIDTH
  canvas.height = SCREENHEIGHT

  ctx.font = `${FONT_HEIGHT}px monospace`
  ctx.textBaseline = 'top'

  const chars = new Uint8Array(buffer)

  let charsPtr = 0
  for (let y = 0; y < SCREENHEIGHT; y += FONT_HEIGHT) {
    for (let x = 0; x < SCREENWIDTH; x += FONT_WIDTH) {
      ++charsPtr
      writeBack(ctx, chars[charsPtr++], x, y, FONT_WIDTH, FONT_HEIGHT)
    }
  }
  charsPtr = 0
  for (let y = 0; y < SCREENHEIGHT; y += FONT_HEIGHT) {
    for (let x = 0; x < SCREENWIDTH; x += FONT_WIDTH) {
      writeChar(ctx, chars[charsPtr++], chars[charsPtr++], x, y)
    }
  }
}

function writeBack(
  ctx: CanvasRenderingContext2D,
  style: number,
  x: number, y: number,
  width: number, height: number,
): void {
  const bg = colors[(style & 0xf0) >> 4]

  ctx.fillStyle = bg
  ctx.fillRect(x, y, width, height)
}

function writeChar(
  ctx: CanvasRenderingContext2D,
  char: number, style: number,
  x: number, y: number,
): void {
  let c: string
  if (char >= 0x80) {
    c = extendedASCII[char - 0x80]
  } else {
    c = String.fromCharCode(char)
  }

  const fg = colors[style & 0x0f]

  ctx.fillStyle = fg
  ctx.fillText(c, x, y)
}
