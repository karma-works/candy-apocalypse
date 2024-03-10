import './style.css'
import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameInstance } from '../doom/doom/instance';
import Level from './Level';
import LevelSelector from './LevelSelector';
import { LumpReader } from '../doom/wad/lump-reader';
import MObj from './MObj';
import MObjSelector from './MObjSelector';
import { MObjType } from '../doom/doom/info/mobj-type';
import { Perf } from 'r3f-perf';
import { TextureLoader } from '../doom/webgl/texture-loader';
import { useSearchParams } from 'react-router-dom';

export default function WadExplorer() {
  const [ searchParams ] = useSearchParams();
  const fileNames = useMemo(() => {
    return [ searchParams.get('iwad') || 'doom1.wad' ]
  }, [ searchParams ])
  const debug = searchParams.get('debug') !== null

  const [ levelName, setLevelName ] = useState<string | null>(null)
  const [ mObjType, setMObjType ] = useState<MObjType | null>(null)
  const [ lumpReader, setLumpReader ] = useState<LumpReader | undefined>(undefined)

  const textureLoader = useMemo(() => new TextureLoader(lumpReader), [ lumpReader ])
  const gameInstance = useMemo(() => new GameInstance({}, lumpReader), [ lumpReader ])

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
            onChangeLevelName={l => {
              setMObjType(null)
              setLevelName(l)
            }}
          />

          <MObjSelector
            textureLoader={textureLoader}
            mObjType={mObjType}
            onChangeMObjType={n => {
              setLevelName(null)
              setMObjType(n)
            }}
          />
        </div>
        <Canvas
          camera={{
            position: [ -512, 512, -512 ],
            far: 4000,
          }}
        >
          { debug && <Perf position="top-left" /> }

          { levelName && lumpReader &&
            <Level
              gameInstance={gameInstance}
              lumpReader={lumpReader}
              textureLoader={textureLoader}
              levelName={levelName}
            /> }

          { mObjType !== null &&
            <MObj
              textureLoader={textureLoader}
              mObjType={mObjType}
            />}
        </Canvas>
      </div>
    </>
  )
}
