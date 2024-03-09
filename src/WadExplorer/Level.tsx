import { Center, MapControls } from '@react-three/drei';
import { extend, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { Level as DoomLevel } from '../doom/level/level';
import { GameInstance } from '../doom/doom/instance';
import { LevelGroup } from '../doom/webgl/objects/level';
import { LumpReader } from '../doom/wad/lump-reader';
import { SKY_FLAT_NAME } from '../doom/level/sky';
import { TextureLoader } from '../doom/webgl/texture-loader';

extend({ LevelGroup })

interface LevelProps {
  gameInstance: GameInstance
  lumpReader: LumpReader
  textureLoader: TextureLoader
  levelName: string
}

export default function Level({ gameInstance, lumpReader, textureLoader, levelName }: LevelProps) {
  const level = useMemo(() => {
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

  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(-512, 512, -512)
  }, [ camera ])

  return (
    <>
      <MapControls
        makeDefault
      />

      <Center top cacheKey={level.name}>
        <levelGroup
          args={[ level, textureLoader ]}
        />
      </Center>
    </>
  )
}
