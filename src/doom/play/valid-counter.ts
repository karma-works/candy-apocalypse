// increment every time a check is made
class ValidCounter {
  private c = 1

  inc(): void {
    this.c++
  }

  check(vc: { validCount: number }) {
    const { c } = this
    if (vc.validCount === c) {
      return true
    }

    vc.validCount = c

    return false
  }
}

export const validCounter = new ValidCounter()
