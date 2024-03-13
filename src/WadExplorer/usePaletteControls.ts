import { ColorMap, ColorMaps } from '../doom/interfaces/colormap';
import { Palette, Palettes } from '../doom/interfaces/palette';
import { useLumpReader, useTextureLoader } from './WadContext';
import { useControls } from 'leva';
import { useMemo } from 'react';

export function usePaletteControls() {
  const lumpReader = useLumpReader()

  const palettes = useMemo(() => {
    if (!lumpReader.numLumps) {
      return {}
    }

    return lumpReader.cacheLumpName(Palettes.DEFAULT_LUMP, Palettes).p
      .reduce(
        (prev, curr, i) => ({ ...prev, [`Palette ${i}`]: curr }),
        {} as { [k: string]: Palette },
      )
  }, [ lumpReader ])

  const colorMaps = useMemo(() => {
    if (!lumpReader.numLumps) {
      return {}
    }

    return lumpReader.cacheLumpName(ColorMaps.DEFAULT_LUMP, ColorMaps).c
      .reduce(
        (prev, curr, i) => ({ ...prev, [`Color Map ${i}`]: curr }),
        {} as { [k: string]: ColorMap },
      )
  }, [ lumpReader ])

  const paletteTexture = useTextureLoader().paletteTexture

  const [ { palette, colorMap } ] = useControls(() => {
    return {
      palette: {
        options: palettes,
        value: Object.keys(palettes).length && paletteTexture.palette,
      },
      colorMap: {
        options: colorMaps,
        value: Object.keys(colorMaps).length && paletteTexture.colorMap,
      },
    }
  }, [ palettes, colorMaps ])

  palette && (paletteTexture.palette = palette)
  colorMap && (paletteTexture.colorMap = colorMap)
}
