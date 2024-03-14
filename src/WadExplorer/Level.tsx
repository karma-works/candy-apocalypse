import { Center, MapControls } from '@react-three/drei';
import { extend, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { useGameInstance, useLumpReader, useTextureLoader } from './WadContext';
import { Level as DoomLevel } from '../doom/level/level';
import { LevelGroup } from '../doom/webgl/objects/level';
import { SKY_FLAT_NAME } from '../doom/level/sky';
import { useControls } from 'leva';
import { useDynamicRef } from '../useDynamicRef';

extend({ LevelGroup })

export const LEVEL_CONTROL_FOLDER = 'Level'

interface LevelProps {
  levelName: string
}

export default function Level({ levelName }: LevelProps) {
  const [ levelGroup, setLevelGroup ] = useDynamicRef<LevelGroup>()

  const textureLoader = useTextureLoader();
  const level = useDoomLevel(levelName);

  useDifficultyControls(levelGroup);

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
          ref={setLevelGroup}
        />
      </Center>
    </>
  )
}

function useDoomLevel(levelName: string) {
  const gameInstance = useGameInstance();
  const lumpReader = useLumpReader();
  const textureLoader = useTextureLoader();

  return useMemo(() => {
    try {
      const level = lumpReader.cacheLumpName(levelName, DoomLevel);
      level.load(lumpReader, textureLoader.flats, textureLoader.textures);

      const skyPatch = gameInstance.getSkyPatch(level.episode, level.map);
      level.sky.texture = textureLoader.textures.numForName(skyPatch);
      level.sky.flatNum = textureLoader.flats.numForName(SKY_FLAT_NAME);

      level.spawnAllThings();
      return level;
    } finally { /* empty */ }
  }, [ lumpReader, levelName, textureLoader, gameInstance ]);
}

function useDifficultyControls(levelGroup: LevelGroup | undefined) {
  const { difficulty } = useControls(LEVEL_CONTROL_FOLDER, {
    difficulty: {
      options: {
        'Easy': 1,
        'Medium': 2,
        'Hard': 4,
      },
      value: 2,
    },
  });

  useEffect(() => {
    levelGroup?.mObjs.forEach(m => {
      const mtOptions = m.mobj.spawnPoint.options;

      if (mtOptions & 16 ||
        !(mtOptions & difficulty)) {
        m.visible = false;
      } else {
        m.visible = true;
      }

    });
  }, [ levelGroup, difficulty ]);
}

