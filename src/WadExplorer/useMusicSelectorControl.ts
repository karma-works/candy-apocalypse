import { useControls } from 'leva'
import { useLumpReader } from './WadContext'
import { useMemo } from 'react'

const MUSIC_CONTROL_FOLDER = 'Music'

export function useMusicSelectorControl(): [string | null] {
  const lumpReader = useLumpReader()

  const musicNames = useMemo(() => {
    return lumpReader.listByType('mus').map(({ name }) => name)
      .filter((v, i, a) => a.indexOf(v) === i)
  }, [ lumpReader ])

  const [ { name } ] = useControls(MUSIC_CONTROL_FOLDER, () => ({
    name: {
      options: [ ...musicNames ],
      value: null,
    },
  }), [ musicNames ])

  return [ name ]
}
