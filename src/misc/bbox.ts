export class BBox {
  top = 0
  bottom = 0
  left = 0
  right = 0

  clear(): void {
    this.top = this.right = Number.MIN_SAFE_INTEGER
    this.bottom = this.left = Number.MAX_SAFE_INTEGER
  }

  add(x: number, y: number): void {
    if (x < this.left) {
      this.left = x
    } else if (x > this.right) {
      this.right = x
    }
    if (y < this.bottom) {
      this.bottom = y
    } else if (y > this.top) {
      this.top = y
    }
  }
}
