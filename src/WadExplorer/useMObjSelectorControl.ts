import { button, useControls } from 'leva'
import { useCallback, useMemo } from 'react'
import { MOBJ_CONTROL_FOLDER } from './MObj'
import { MObjType } from '../doom/doom/info/mobj-type'
import { mObjInfos } from '../doom/doom/info/mobj-infos'
import { states } from '../doom/doom/info/states'
import { useTextureLoader } from './WadContext'

export function useMObjSelectorControl(): [MObjType | null, (mObjType: MObjType | null) => void] {
  const textureLoader = useTextureLoader()

  const mObjTypes = useMemo(() => {
    return Array.from({ length: MObjType.NUM_MOBJ_TYPES }, (_, i) => i)
      .filter((type: MObjType) => {
        const st = states[mObjInfos[type].spawnState]
        const sprDef = textureLoader.spriteDefs[st.sprite]

        return sprDef !== undefined && sprDef.frames.length
      })
  }, [ textureLoader ])

  const mObjNameToType = useMemo(() => {
    return mObjTypes.reduce(
      (acc, curr) => ({ ...acc, [MObjType[curr]]: curr }),
      {} as { [k: string]: MObjType},
    )
  }, [ mObjTypes ])

  const [ { type }, set ] = useControls(MOBJ_CONTROL_FOLDER, () => ({
    type: {
      options: { ...mObjNameToType },
      value: null,
    },
    next: button((get) => {
      let idx = mObjTypes.indexOf(get(`${MOBJ_CONTROL_FOLDER}.type`)) + 1
      if (idx >= mObjTypes.length) {
        idx = 0
      }
      set({ type: mObjTypes[idx] })
    }),
  }), [ mObjNameToType ])

  const setMObjType = useCallback((type: MObjType | null) => {
    set({ type })
  }, [ set ])

  return [ type, setMObjType ]
}
