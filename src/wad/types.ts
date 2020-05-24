export interface WadInfo {
  // Should be "IWAD" or "PWAD".
  identification: string
  numLumps: number
  infoTableOfs: number
}


export interface FileLump {
  filePos: number
  size: number
  name: string
}

//
// WADFILE I/O related stuff.
//
export interface LumpInfo {
  name: string
  handle: ArrayBuffer | null
  position: number
  size: number
}
