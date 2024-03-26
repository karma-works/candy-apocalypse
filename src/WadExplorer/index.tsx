import './style.css'
import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Jukebox from './Jukebox';
import Level from './Level';
import MObj from './MObj';
import { Perf } from 'r3f-perf';
import { WadProvider } from './WadContext';
import { useLevelSelectorControl } from './useLevelSelectorControl';
import { useMObjSelectorControl } from './useMObjSelectorControl';
import { useMusicSelectorControl } from './useMusicSelectorControl';
import { usePaletteControls } from './usePaletteControls';
import { useSearchParams } from 'react-router-dom';

function WadExplorer() {
  const [ searchParams ] = useSearchParams();
  const debug = searchParams.get('debug') !== null

  usePaletteControls()

  const [ levelName, setLevelName ] = useLevelSelectorControl()
  const [ mObjType, setMObjType ] = useMObjSelectorControl()
  const [ musicName ] = useMusicSelectorControl()

  useEffect(() => {
    mObjType !== null && setLevelName(null)
  }, [ mObjType, setLevelName ])
  useEffect(() => {
    levelName !== null && setMObjType(null)
  }, [ levelName, setMObjType ])

  return (
    <div className="WadExplorer">
      <div className="WadExplorerToolbar">

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

        { musicName !== null &&
          <Jukebox musicName={musicName} /> }
      </Canvas>
    </div>
  )
}


export default function WadExplorerRoot() {
  const [ searchParams ] = useSearchParams();
  const fileNames = useMemo(() => {
    return [ searchParams.get('iwad') || 'doom1.wad' ]
  }, [ searchParams ])

  return (
    <WadProvider fileNames={fileNames}>
      <WadExplorer />
    </WadProvider>
  )
}
