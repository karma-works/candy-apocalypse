import { Center, MapControls } from '@react-three/drei';
import { Level as DoomLevel } from '../doom/level/level';
import { LevelGroup } from '../doom/webgl/objects/level-scene';
import { TextureLoader } from '../doom/webgl/texture-loader';
import { extend } from '@react-three/fiber';

extend({ LevelGroup })

interface LevelProps {
  level: DoomLevel
  textureLoader: TextureLoader
}

export default function Level({ level, textureLoader }: LevelProps) {
  const scale = 1 / (1 << 8)

  return (
    <>
      <MapControls
        makeDefault
      />

      <Center cacheKey={level.name}>
        <levelGroup
          args={[ level, textureLoader ]}
          scale={ scale }
        />
      </Center>
    </>
  )
}
