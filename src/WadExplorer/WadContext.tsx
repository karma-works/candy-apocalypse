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

export function WadProvider({ children, fileNames }: WadProviderProps) {
  const [ lumpReader, setLumpReader ] = useState(new LumpReader())

  const textureLoader = useMemo(() => {
    return new TextureLoader(lumpReader.numLumps ? lumpReader : undefined)
  }, [ lumpReader ])
  const gameInstance = useMemo(() => {
    return new GameInstance({}, lumpReader.numLumps ? lumpReader : undefined)
  }, [ lumpReader ])

  useEffect(() => {
    async function fetchWad(fileNames: readonly string[]) {
      const lumpReader = new LumpReader()
      await lumpReader.initMultipleFiles(fileNames)

      setLumpReader(lumpReader)
    }
    fetchWad(fileNames);
  }, [ fileNames ])

  return (
    <WadContext.Provider value={{ lumpReader, textureLoader, gameInstance }}>
      { children }
    </WadContext.Provider>
  )
}
