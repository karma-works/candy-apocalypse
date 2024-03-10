import { extend, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { MObj as DoomMObj } from '../doom/play/mobj/mobj'
import { MObj as MObjMesh } from '../doom/webgl/objects/mobj'
import { MObjType } from '../doom/doom/info/mobj-type'
import { OrbitControls } from '@react-three/drei'
import Studio from './Studio'
import { TextureLoader } from '../doom/webgl/texture-loader'

extend({ MObj: MObjMesh })

interface SpriteProps {
  textureLoader: TextureLoader
  mObjType: MObjType
}

export default function MObj({ textureLoader, mObjType }: SpriteProps) {
  const mObj = useMemo(() => {
    return new DoomMObj(mObjType)
  }, [ mObjType ])

  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(-128, 64, 128)
  }, [ camera ])

  return (
    <>
      <OrbitControls
        makeDefault
        dampingFactor={0.2}
        enablePan={false}
      />
      <Studio
        textureLoader={textureLoader}
        width={256}
        height={150}
      />

      <mObj
        args={[ mObj, textureLoader ]}
      />
    </>
  )
}
