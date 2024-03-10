import './style.css'
import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Level from './Level';
import LevelSelector from './LevelSelector';
import MObj from './MObj';
import MObjSelector from './MObjSelector';
import { MObjType } from '../doom/doom/info/mobj-type';
import { Perf } from 'r3f-perf';
import { WadProvider } from './WadContext';
import { useSearchParams } from 'react-router-dom';

export default function WadExplorer() {
  const [ searchParams ] = useSearchParams();
  const fileNames = useMemo(() => {
    return [ searchParams.get('iwad') || 'doom1.wad' ]
  }, [ searchParams ])
  const debug = searchParams.get('debug') !== null

  const [ levelName, setLevelName ] = useState<string | null>(null)
  const [ mObjType, setMObjType ] = useState<MObjType | null>(null)

  return (
    <WadProvider fileNames={fileNames}>
      <div className="WadExplorer">
        <div className="WadExplorerToolbar">
          <LevelSelector
            levelName={levelName}
            onChangeLevelName={l => {
              setMObjType(null)
              setLevelName(l)
            }}
          />

          <MObjSelector
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

          { levelName &&
            <Level levelName={levelName} /> }

          { mObjType !== null &&
            <MObj mObjType={mObjType} />}
        </Canvas>
      </div>
    </WadProvider>
  )
}
