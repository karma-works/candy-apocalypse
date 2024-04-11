/* eslint-disable react-refresh/only-export-components */
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { GameInstance } from '../doom/doom/instance'
import { LumpReader } from '../doom/wad/lump-reader'
import { TextureLoader } from '../doom/webgl/texture-loader'

interface WadProviderProps {
  children?: ReactNode
  fileNames: readonly string[],
}

interface WadContextValue {
  lumpReader: LumpReader
  textureLoader: TextureLoader
  gameInstance: GameInstance
}

const WadContext = createContext<WadContextValue>({
  lumpReader: new LumpReader(),
  textureLoader: new TextureLoader(),
  gameInstance: new GameInstance({}),
})

export const useLumpReader = () => useContext(WadContext).lumpReader
export const useTextureLoader = () => useContext(WadContext).textureLoader
export const useGameInstance = () => useContext(WadContext).gameInstance

const enum State { Loading, Loaded, Error }

export function WadProvider({ children, fileNames }: WadProviderProps) {
  const [ lumpReader, setLumpReader ] = useState(new LumpReader())

  const [ state, setState ] = useState(State.Loading)
  const [ err, setErr ] = useState<unknown>()

  const textureLoader = useMemo(() => {
    try {
      return new TextureLoader(lumpReader.numLumps ? lumpReader : undefined)
    } catch (err) {
      setErr(err)
      setState(State.Error)
    }
    return new TextureLoader()
  }, [ lumpReader ])
  const gameInstance = useMemo(() => {
    try {
      return new GameInstance({}, lumpReader.numLumps ? lumpReader : undefined)
    } catch (err) {
      setErr(err)
      setState(State.Error)
    }
    return new GameInstance({})
  }, [ lumpReader ])

  useEffect(() => {
    async function fetchWad(fileNames: readonly string[]) {
      const lumpReader = new LumpReader()
      try {
        await lumpReader.initMultipleFiles(fileNames)
        setLumpReader(lumpReader)
        setState(State.Loaded)
      } catch (err) {
        setErr(err)
        setState(State.Error)
      }
    }
    setState(State.Loading)
    fetchWad(fileNames);
  }, [ fileNames ])

  let body: ReactNode = <></>
  switch (state) {
  case State.Loading:
    body = <>Loading...</>
    break
  case State.Error:
    body = <>Error: { `${err}` }</>
    break
  case State.Loaded:
    body = children
    break
  }

  return (
    <WadContext.Provider value={{ lumpReader, textureLoader, gameInstance }}>
      { body }
    </WadContext.Provider>
  )
}
