import './style.css'
import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Level as DoomLevel } from '../doom/level/level';
import Level from './Level';
import { LumpReader } from '../doom/wad/lump-reader';
import { TextureLoader } from '../doom/webgl/texture-loader';

function fetchLevel(
  lumpReader: LumpReader,
  e: number, m: number,
): DoomLevel | undefined {
  const candidates = [ `E${e}M${m}`, `map0${m}`, `map${m}` ]
  for (const name of candidates) {
    try {
      const num = lumpReader.getNumForName(name)
      return lumpReader.cacheLumpNum(num, DoomLevel)
    } finally { /* empty */ }
  }
}

export default function WadExplorer() {
  const [ episode ] = useState(1)
  const [ map ] = useState(1)
  const [ lumpReader, setLumpReader ] = useState<LumpReader | undefined>(undefined)

  const textureLoader = useMemo(() => new TextureLoader(lumpReader), [ lumpReader ])

  const level = useMemo(() => {
    if (!lumpReader) {
      return undefined
    }
    const level = fetchLevel(lumpReader, episode, map)
    if (level) {
      level.load(lumpReader, textureLoader.flats, textureLoader.textures)
    }
    return level
  }, [ lumpReader, episode, map, textureLoader ])

  useEffect(() => {
    const fileNames = [ 'doom1.wad' ]
    async function fetchWad() {
      const lumpReader = new LumpReader()
      await lumpReader.initMultipleFiles(fileNames)

      setLumpReader(lumpReader)
    }
    fetchWad();
  }, [])

  return (
    <>
      <div className="WadExplorer">
        <Canvas
          camera={{
            position: [ -2, 2, -2 ],
          }}
        >
          { level && <Level level={level} textureLoader={textureLoader} /> }
        </Canvas>
      </div>
    </>
  )
}
