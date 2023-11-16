import { TickCmd } from '../tick-cmd'

// Networking and tick handling related.
export const BACKUP_TICS = 12

//
// Network packet data.
//
export class DoomData {
  static sizeOf = 4 + 4 + TickCmd.sizeOf * BACKUP_TICS

  private ints: Uint32Array

  // High bit is retransmit request.
  get checksum(): number {
    return this.ints[0]
  }
  set checksum(v: number) {
    this.ints[0] = v
  }
  // Only valid if NCMD_RETRANSMIT.
  get retransmitFrom(): number {
    return this.bytes[4]
  }
  set retransmitFrom(v: number) {
    this.bytes[4] = v
  }

  get startTic(): number {
    return this.bytes[5]
  }
  set startTic(v: number) {
    this.bytes[5] = v
  }
  get player(): number {
    return this.bytes[6]
  }
  set player(v: number) {
    this.bytes[6] = v
  }
  get numTics(): number {
    return this.bytes[7]
  }
  set numTics(v: number) {
    this.bytes[7] = v
  }

  readonly cmds: readonly TickCmd[]

  constructor(private bytes = new Uint8Array(DoomData.sizeOf)) {
    this.ints = new Uint32Array(this.bytes.buffer)
    this.cmds = Array.from({ length: BACKUP_TICS },
      (_, i) => {
        const offset = 8
        return new TickCmd(this.bytes.subarray(
          offset + i * TickCmd.sizeOf,
          offset + (i + 1) * TickCmd.sizeOf,
        ))
      })
  }

  copyFrom(from: DoomData): void {
    this.bytes.set(from.bytes)
  }
}
