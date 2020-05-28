export function toupper(c: number): number {
  const str = String.fromCharCode(c)
  const upperStr = str.toUpperCase()
  const code = upperStr.charCodeAt(0)
  if (isNaN(code)) {
    return c
  }
  return code
}
