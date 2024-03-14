import { button, useControls } from 'leva'
import { useCallback, useEffect, useMemo } from 'react'
import { LEVEL_CONTROL_FOLDER } from './Level'
import { useLumpReader } from './WadContext'

export function useLevelSelectorControl(): [string | null, (levelName: string | null) => void] {
  const lumpReader = useLumpReader()

  const levelNames = useMemo(() => {
    return lumpReader.listByType('level').map(({ name }) => name)
  }, [ lumpReader ])

  const [ { name }, set ] = useControls(LEVEL_CONTROL_FOLDER, () => ({
    name: {
      options: [ ...levelNames ],
      value: null,
    },
    next: button((get) => {
      let idx = levelNames.indexOf(get(`${LEVEL_CONTROL_FOLDER}.name`)) + 1
      if (idx >= levelNames.length) {
        idx = 0
      }
      set({ name: levelNames[idx] })
    }),
  }), [ levelNames ])

  const setLevelName = useCallback((name: string | null) => {
    set({ name })
  }, [ set ])

  useEffect(
    () => setLevelName(levelNames[0] || null),
    [ levelNames, setLevelName ],
  )

  return [ name, setLevelName ]
}
