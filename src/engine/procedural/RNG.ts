/**
 * Mulberry32 seeded pseudo-random number generator.
 * Same seed always produces the same sequence.
 */
export class RNG {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  next(): number {
    this.s = this.s + 0x6d2b79f5 >>> 0;
    let t = Math.imul(this.s ^ this.s >>> 15, 1 | this.s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    const out = [ ...arr ];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [ out[i], out[j] ] = [ out[j], out[i] ];
    }
    return out;
  }
}
