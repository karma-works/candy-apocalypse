export class Rendering {

  // Blocky mode, has default, 0 = high, 1 = normal
  detailLevel = 0
  screenBlocks = 9
  // temp for screenblocks (0-9)
  screenSize = this.screenBlocks - 3


  //
  // R_SetViewSize
  // Do not really change anything here,
  //  because it might be in the middle of a refresh.
  // The change will take effect next refresh.
  //
  setSizeNeeded = false
  private setBlocks = 0
  private setDetail = 0

  setViewSize(blocks: number, detail: number): void {
    this.setSizeNeeded = true
    this.setBlocks = blocks
    this.setDetail = detail
  }

  //
  // R_ExecuteSetViewSize
  //
  executeSetViewSize(): void {
    this.setSizeNeeded = false
  }

  init(): void {
    this.setViewSize(this.screenBlocks, this.detailLevel)
  }
}
