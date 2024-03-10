import { ButtonGroup, IconButton, Option, Select } from '@mui/joy';
import { useEffect, useMemo } from 'react';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLumpReader } from './WadContext';
interface SelectorProps {
  levelName: string | null
  onChangeLevelName: (l: string | null) => void
}

export default function LevelSelector({ levelName, onChangeLevelName }: SelectorProps) {
  const lumpReader = useLumpReader()

  const levels = useMemo(() => {
    if (!lumpReader) {
      return []
    }
    return lumpReader.listByType('level').map(({ name }) => name)
  }, [ lumpReader ])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onChangeLevelName(levels[0]), [ levels ])

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
