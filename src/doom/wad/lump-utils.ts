export function assertBoolean(v: number): boolean {
  switch (v) {
  case 0: return false
  case 1: return true
  default: throw `${v} should be boolean`
  }
}
