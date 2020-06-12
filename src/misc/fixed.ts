//
// Fixed point, 32bit as 16.16.
//
export const FRACBITS = 16
export const FRACUNIT = 1 << FRACBITS

export function mul(a: number, b: number): number {
  return Math.floor(a * b / 0x10000) >> 0
}
export function div(a: number, b: number): number {
  if (Math.abs(a) >> 14 >= Math.abs(b)) {
    return (a^b) < 0 ? -2147483648 : 2147483647
  }
  return div2(a, b)
}

function div2(a: number, b: number): number {
  const c = a / b * FRACUNIT

  if (c >= 2147483648.0 || c < -2147483648.0) {
    throw 'FixedDiv: divide by zero'
  }
  return c << 0
}
