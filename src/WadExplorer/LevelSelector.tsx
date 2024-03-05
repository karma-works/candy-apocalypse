import { ButtonGroup, IconButton, Option, Select } from '@mui/joy';
import { LumpReader } from '../doom/wad/lump-reader';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useMemo } from 'react';
interface SelectorProps {
  lumpReader?: LumpReader
  levelName: string | null
  onChangeLevelName: (l: string | null) => void
}

export default function LevelSelector({ lumpReader, levelName, onChangeLevelName }: SelectorProps) {
  const levels = useMemo(() => {
    if (!lumpReader) {
      return []
    }
    return lumpReader.listByType('level').map(({ name }) => name)
  }, [ lumpReader ])

  const [ before, next ] = useMemo(() => {
    const idx = levels.indexOf(levelName!)
    return [ levels[idx - 1], levels[idx + 1] ]
  }, [ levels, levelName ])

  return <ButtonGroup>
    <IconButton
      onClick={_ => onChangeLevelName(before)}
      disabled={!before}
    >
      <NavigateBeforeIcon />
    </IconButton>
    <Select
      color="primary"
      placeholder="Levels"
      variant="soft"
      value={levelName}
      onChange={(_, v) => onChangeLevelName(v)}
    >
      { levels.map(l =>
        <Option
          key={l}
          value={l}
        >
          { l }
        </Option>,
      ) }
    </Select>
    <IconButton
      onClick={_ => onChangeLevelName(next)}
      disabled={!next}
    >
      <NavigateNextIcon />
    </IconButton>
  </ButtonGroup>
}
