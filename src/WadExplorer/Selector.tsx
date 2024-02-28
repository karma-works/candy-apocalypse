import { Option, Select } from '@mui/joy';
import { LumpReader } from '../doom/wad/lump-reader';
import { useMemo } from 'react';

interface SelectorProps {
  lumpReader?: LumpReader
  levelName: string | null
  onChangeLevelName: (l: string | null) => void
}

export default function Selector({ lumpReader, levelName, onChangeLevelName }: SelectorProps) {
  const levels = useMemo(() => {
    if (!lumpReader) {
      return []
    }
    return lumpReader.listByType('level').map(({ name }) => name)
  }, [ lumpReader ])

  return (
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
  )
}
