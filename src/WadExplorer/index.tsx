import './style.css'
import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Level as DoomLevel } from '../doom/level/level';
import Level from './Level';
import { LumpReader } from '../doom/wad/lump-reader';
import { Perf } from 'r3f-perf';
import Selector from './Selector';
import { TextureLoader } from '../doom/webgl/texture-loader';

export default function WadExplorer() {
  const [ levelName, setLevelName ] = useState<string | null>(null)
  const [ lumpReader, setLumpReader ] = useState<LumpReader | undefined>(undefined)

  const textureLoader = useMemo(() => new TextureLoader(lumpReader), [ lumpReader ])

  const level = useMemo(() => {
    if (!lumpReader || !levelName) {
      return undefined
    }
    try {
      const level = lumpReader.cacheLumpName(levelName, DoomLevel)
      level.load(lumpReader, textureLoader.flats, textureLoader.textures)
      return level
    } finally { /* empty */ }
  }, [ lumpReader, levelName, textureLoader ])

  useEffect(() => {
    const fileNames = [ 'doom1.wad' ]
    async function fetchWad() {
      const lumpReader = new LumpReader()
      await lumpReader.initMultipleFiles(fileNames)

      setLumpReader(lumpReader)
      setLevelName(lumpReader.listByType('level')[0]?.name)
    }
    fetchWad();
  }, [])

  return (
    <>
      <div className="WadExplorer">
        <div className="WadExplorerToolbar">
          <Selector
            lumpReader={lumpReader}
            levelName={levelName}
            onChangeLevelName={l => setLevelName(l)}
          />
        </div>
        <Canvas
          camera={{
            position: [ -2, 2, -2 ],
          }}
        >
          <Perf position="top-left" />

          { level && <Level level={level} textureLoader={textureLoader} /> }
        </Canvas>
      </div>
    </>
  )
}
