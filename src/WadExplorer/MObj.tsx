import { Center, OrbitControls } from '@react-three/drei'
import { button, useControls } from 'leva'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { MObj as DoomMObj } from '../doom/play/mobj/mobj'
import { FRACUNIT } from '../doom/misc/fixed'
import { MObjInfo } from '../doom/doom/info/mobj-info'
import { MObj as MObjMesh } from '../doom/webgl/objects/mobj'
import { MObjType } from '../doom/doom/info/mobj-type'
import { StateNum } from '../doom/doom/info/state-num'
import Studio from './Studio'
import { TICRATE } from '../doom/global/doomdef'
import { states } from '../doom/doom/info/states'
import { useDynamicRef } from '../useDynamicRef'
import { useTextureLoader } from './WadContext'

export const MOBJ_CONTROL_FOLDER = 'Map Object'

extend({ MObj: MObjMesh })

interface SpriteProps {
  mObjType: MObjType
}

type States = {
  [K in keyof MObjInfo]: K extends `${string}State` ? K : never;
}[keyof MObjInfo];

const allStates: States[] = [
  'spawnState', 'seeState', 'painState', 'meleeState', 'missileState', 'deathState', 'xdeathState', 'raiseState',
]

export default function MObj({ mObjType }: SpriteProps) {
  const [ mObjMesh, setMObjMesh ] = useDynamicRef<MObjMesh>()

  const textureLoader = useTextureLoader()
  const mObj = useMemo(() => new DoomMObj(mObjType), [ mObjType ])

  const setStateNum = useMObjAnimator(mObj, mObjMesh)

  useControls(MOBJ_CONTROL_FOLDER, () => {
    return allStates
      .filter(s => mObj.info[s] !== StateNum.Null)
      .reduce((a, s) => {
        return {
          ...a,
          [s]: button(() => setStateNum(mObj.info[s])),
        }
      }, {})
  }, [ mObj ])

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
        width={256}
        minHeight={Math.max(mObj.height / FRACUNIT, 64)}
      />

      <Center top cacheKey={mObj}>
        <mObj
          args={[ mObj, textureLoader ]}
          ref={setMObjMesh}
        />
      </Center>
    </>
  )
}

// Tic at 35 frame per second, like the DOOM engine
function useTic(callback: () => void) {
  const [ pendingTics, setPendingTics ] = useState(0)

  useFrame((_, delta) => {
    let newPendingTics = pendingTics + delta * TICRATE

    for (; newPendingTics >= 0; --newPendingTics) {
      callback()
    }

    setPendingTics(newPendingTics)
  })
}

function useMObjAnimator(mObj: DoomMObj, mObjMesh: MObjMesh | undefined) {
  const [ stateNum, setStateNum ] = useState(mObj.info.spawnState)

  // reset default state when changing mobj
  useEffect(() => setStateNum(mObj.info.spawnState), [ mObj ])

  // tics left before switching to next state
  const [ ticsLeft, setTicsLeft ] = useState(Number.MAX_SAFE_INTEGER)

  useEffect(() => {
    if (mObjMesh === undefined) {
      return
    }
    if (stateNum === StateNum.Null) {
      mObjMesh.visible = false
      return
    }

    const st = states[stateNum]
    setTicsLeft(st.tics === -1 ? Number.MAX_SAFE_INTEGER : st.tics)
    mObj.sprite = st.sprite
    mObj.frame = st.frame

    mObjMesh.update(255)
  }, [ mObj, mObjMesh, stateNum ])

  useTic(() => {
    setTicsLeft(t => t - 1)
    if (ticsLeft - 1 < 0) {
      setStateNum(states[stateNum].nextState)
    }
  })

  return setStateNum
}
