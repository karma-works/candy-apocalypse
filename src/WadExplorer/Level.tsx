import { Center, MapControls } from '@react-three/drei';
import { Level as DoomLevel } from '../doom/level/level';
import { LevelScene } from '../doom/webgl/objects/level-scene';
import { TextureLoader } from '../doom/webgl/texture-loader';

interface LevelProps {
  level: DoomLevel
  textureLoader: TextureLoader
}

export default function Level({ level, textureLoader }: LevelProps) {
  const levelScene = new LevelScene(level, textureLoader)

  const scale = 1 / (1 << 8)

  return (
    <>
      <MapControls
        makeDefault
      />
      <Center>
        <primitive
          object={levelScene}
          scale={scale}
        />
      </Center>
    </>
  )
}
