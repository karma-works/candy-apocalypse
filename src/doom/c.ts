export function toupper(c: number): number {
  const str = String.fromCharCode(c)
  const upperStr = str.toUpperCase()
  const code = upperStr.charCodeAt(0)
  if (isNaN(code)) {
    return c
  }
  return code
}

export function tostring(buffer: ArrayBuffer, offset: number, length: number): string {
  let str = String.fromCharCode(...new Int8Array(buffer, offset, length))
  const nullIdx = str.indexOf(String.fromCharCode(0))
  if (nullIdx >= 0) {
    str = str.substr(0, nullIdx)
  }
  return str
}
