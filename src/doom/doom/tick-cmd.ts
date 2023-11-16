// The data sampled per tick (single player)
// and transmitted to other peers (multiplayer).
// Mainly movements/button commands per game tick,
// plus a checksum for internal state consistency.
export class TickCmd {
  static sizeOf = 8

  private chars: Int8Array
  private shorts: Int16Array

  // *2048 for move
  get forwardMove(): number {
    return this.chars[0]
  }
  set forwardMove(v: number) {
    this.chars[0] = v
  }
  // *2048 for move
  get sideMove(): number {
    return this.chars[1]
  }
  set sideMove(v: number) {
    this.chars[1] = v
  }
  // <<16 for angle delta
  get angleTurn(): number {
    return this.shorts[1]
  }
  set angleTurn(v: number) {
    this.shorts[1] = v
  }
  // checks for net game
  get consistancy(): number {
    return this.shorts[2]
  }
  set consistancy(v: number) {
    this.shorts[2] = v
  }
  get chatChar(): number {
    return this.bytes[6]
  }
  set chatChar(v: number) {
    this.bytes[6] = v
  }
  get buttons(): number {
    return this.bytes[7]
  }
  set buttons(v: number) {
    this.bytes[7] = v
  }

  constructor(private bytes = new Uint8Array(TickCmd.sizeOf)) {
    this.chars = new Int8Array(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength)
    this.shorts = new Int16Array(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength / 2)
  }
  reset(): void {
    this.bytes.fill(0)
  }
  copyFrom(from: TickCmd): void {
    this.bytes.set(from.bytes)
  }
  unArchive(buffer: ArrayBuffer): void {
    this.bytes.set(new Uint8Array(buffer))
  }
  archive(): ArrayBuffer {
    return this.bytes.slice().buffer
  }
}
