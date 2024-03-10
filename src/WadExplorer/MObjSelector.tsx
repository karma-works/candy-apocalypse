import { ButtonGroup, IconButton, Option, Select } from '@mui/joy';
import { MObjType } from '../doom/doom/info/mobj-type';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { SpriteNum } from '../doom/doom/info/sprite-num';
import { mObjInfos } from '../doom/doom/info/mobj-infos';
import { states } from '../doom/doom/info/states';
import { useMemo } from 'react';
import { useTextureLoader } from './WadContext';

interface SelectorProps {
  mObjType: MObjType | null
  onChangeMObjType: (n: MObjType | null) => void
}

export default function MObjSelector({ mObjType, onChangeMObjType }: SelectorProps) {
  const textureLoader = useTextureLoader()

  const mObjTypes = useMemo(() => {
    return Array.from({ length: MObjType.NUM_MOBJ_TYPES }, (_, i) => i)
      .filter((type: MObjType) => {
        const st = states[mObjInfos[type].spawnState]
        const sprDef = textureLoader.spriteDefs[st.sprite]

        return sprDef !== undefined && sprDef.frames.length
      })
  }, [ textureLoader ])

  const [ before, next ] = useMemo(() => {
    const idx = mObjTypes.indexOf(mObjType!)
    return [ mObjTypes[idx - 1], mObjTypes[idx + 1] ]
  }, [ mObjTypes, mObjType ])

  return <ButtonGroup>
    <IconButton
      onClick={_ => onChangeMObjType(before)}
      disabled={before < 0}
    >
      <NavigateBeforeIcon />
    </IconButton>
    <Select
      color="primary"
      placeholder="Map Objects"
      variant="soft"
      value={mObjType}
      onChange={(_, v) => v !== null && onChangeMObjType(v)}
    >
      { mObjTypes.map((type) =>
        <Option
          key={type}
          value={type}
        >
          { MObjType[type] }
        </Option>,
      ) }
    </Select>
    <IconButton
      onClick={_ => onChangeMObjType(next)}
      disabled={next >= SpriteNum.NUMSPRITES}
    >
      <NavigateNextIcon />
    </IconButton>
  </ButtonGroup>
}
