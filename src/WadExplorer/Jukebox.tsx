import { useEffect, useMemo } from 'react'
import { Mus } from '../doom/doom/sounds/mus'
import { MusPlayer } from '../doom/interfaces/smplr/mus-player'
import { useAudio } from '../AudioContext'
import { useLumpReader } from './WadContext'

interface MusicProps {
  musicName: string
}

/**
 * Currently not showing anything. Might add visuals later?
 */
export default function Jukebox({ musicName }: MusicProps) {
  const lumpReader = useLumpReader()

  const audioCtx = useAudio()
  const music = useMemo(() => {
    return musicName ? lumpReader.cacheLumpName(musicName, Mus) : null
  }, [ lumpReader, musicName ])

  const player = useMemo(() => {
    return music ? new MusPlayer(audioCtx, music) : null
  }, [ audioCtx, music ])

  useEffect(() => {
    player?.play(false)
    return () => player?.stop()
  }, [ player ])

  return <></>
}
