import { ButtonGroup, IconButton, Option, Select } from '@mui/joy';
import { MObjType } from '../doom/doom/info/mobj-type';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { SpriteNum } from '../doom/doom/info/sprite-num';
import { useMemo } from 'react';

interface SelectorProps {
  mObjType: MObjType | null
  onChangeMObjType: (n: MObjType | null) => void
}

export default function MObjSelector({ mObjType, onChangeMObjType }: SelectorProps) {
  const sprites = useMemo(() => {
    return Array.from({ length: MObjType.NUM_MOBJ_TYPES }, (_, i) => {
      return MObjType[i]
    })
  }, [])

  if (mObjType === null) {
    mObjType = -1
  }
  const before = mObjType - 1
  const next = mObjType + 1

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
      onChange={(_, v) => onChangeMObjType(v)}
    >
      { sprites.map((name, i) =>
        <Option
          key={i}
          value={i}
        >
          { name }
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
