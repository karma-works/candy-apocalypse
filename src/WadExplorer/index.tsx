import './style.css'
import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Level as DoomLevel } from '../doom/level/level';
import { GameInstance } from '../doom/doom/instance';
import Level from './Level';
import LevelSelector from './LevelSelector';
import { LumpReader } from '../doom/wad/lump-reader';
import { Perf } from 'r3f-perf';
import { SKY_FLAT_NAME } from '../doom/level/sky';
import { TextureLoader } from '../doom/webgl/texture-loader';
import { useSearchParams } from 'react-router-dom';

export default function WadExplorer() {
  const [ searchParams ] = useSearchParams();
  const fileNames = useMemo(() => {
    return [ searchParams.get('iwad') || 'doom1.wad' ]
  }, [ searchParams ])
  const debug = searchParams.get('debug') !== null

  const [ levelName, setLevelName ] = useState<string | null>(null)
  const [ lumpReader, setLumpReader ] = useState<LumpReader | undefined>(undefined)

  const textureLoader = useMemo(() => new TextureLoader(lumpReader), [ lumpReader ])
  const gameInstance = useMemo(() => new GameInstance({}, lumpReader), [ lumpReader ])

  const level = useMemo(() => {
    if (!lumpReader || !levelName) {
      return undefined
    }
    try {
      const level = lumpReader.cacheLumpName(levelName, DoomLevel)
      level.load(lumpReader, textureLoader.flats, textureLoader.textures)

      const skyPatch = gameInstance.getSkyPatch(level.episode, level.map)
      level.sky.texture = textureLoader.textures.numForName(skyPatch)
      level.sky.flatNum = textureLoader.flats.numForName(SKY_FLAT_NAME)

      level.spawnAllThings()
      return level
    } finally { /* empty */ }
  }, [ lumpReader, levelName, textureLoader, gameInstance ])

  useEffect(() => {
    async function fetchWad(fileNames: string[]) {
      const lumpReader = new LumpReader()
      await lumpReader.initMultipleFiles(fileNames)

      setLumpReader(lumpReader)
      setLevelName(lumpReader.listByType('level')[0]?.name)
    }
    fetchWad(fileNames);
  }, [ fileNames ])

  return (
    <>
      <div className="WadExplorer">
        <div className="WadExplorerToolbar">
          <LevelSelector
            lumpReader={lumpReader}
            levelName={levelName}
            onChangeLevelName={l => setLevelName(l)}
          />
        </div>
        <Canvas
          camera={{
            position: [ -512, 512, -512 ],
            far: 4000,
          }}
        >
          { debug && <Perf position="top-left" /> }

          { level && <Level level={level} textureLoader={textureLoader} /> }
        </Canvas>
      </div>
    </>
  )
}
