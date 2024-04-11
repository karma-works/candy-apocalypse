import { useEffect, useMemo, useRef } from 'react'
import { Patch as DoomPatch } from '../doom/rendering/defs/patch'
import { Video as IVideo } from '../doom/interfaces/video'
import { Palettes } from '../doom/interfaces/palette'
import { Video as RVideo } from '../doom/rendering/video'
import { useLumpReader } from './WadContext'

interface PatchProps {
  lump: string | number
}

export default function Patch({ lump }: PatchProps) {
  const canvas = useRef<HTMLCanvasElement>(null)

  const palette = usePalette()
  const patch = usePatch(lump)

  useEffect(() => {
    if (!patch || !palette) {
      return
    }

    const rVideo = new RVideo({ logical: [ patch.width, patch.height ] })
    rVideo.init(1)

    const iVideo = new IVideo(rVideo)
    iVideo.screen = canvas.current
    iVideo.init()
    iVideo.palette = palette

    rVideo.drawPatch(patch.leftOffset, patch.topOffset, 0, patch)
    iVideo.finishUpdate()
  }, [ patch, palette ])

  return (
    <canvas
      ref={canvas}
      width={patch?.width}
      height={patch?.height}
    >
    </canvas>
  )
}

function usePalette() {
  const lumpReader = useLumpReader()
  return useMemo(() => {
    if (!lumpReader.numLumps) {
      return undefined
    }

    return lumpReader.cacheLumpName(Palettes.DEFAULT_LUMP, Palettes).p[0]
  }, [ lumpReader ])
}

function usePatch(lump: string | number) {
  const lumpReader = useLumpReader()
  return useMemo(() => {
    if (!lumpReader.numLumps) {
      return undefined
    }

    if (typeof lump === 'number') {
      return lumpReader.cacheLumpNum(lump, DoomPatch)
    }
    return lumpReader.cacheLumpName(lump, DoomPatch)
  }, [ lump, lumpReader ])
}

