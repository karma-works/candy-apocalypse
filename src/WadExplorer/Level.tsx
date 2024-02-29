import { Center, MapControls } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { Level as DoomLevel } from '../doom/level/level';
import { LevelScene } from '../doom/webgl/objects/level-scene';
import { TextureLoader } from '../doom/webgl/texture-loader';

interface LevelProps {
  level: DoomLevel
  textureLoader: TextureLoader
}

export default function Level({ level, textureLoader }: LevelProps) {
  const [ levelScene, setLevelScene ] = useState<LevelScene | undefined>()

  useEffect(() => {
    const levelScene = new LevelScene(level, textureLoader)
    setLevelScene(levelScene)
    return () => {
      levelScene.dispose()
    }
  }, [ level, textureLoader ])

  const scale = 1 / (1 << 8)

  return (
    <>
      <MapControls
        makeDefault
      />
      {
        levelScene &&
        <Center cacheKey={levelScene.name}>
          <primitive
            object={levelScene}
            scale={scale}
          />
        </Center>
      }
    </>
  )
}
