import { Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';
import { LumpReader } from '../doom/wad/lump-reader';
import { useMemo } from 'react';

interface SelectorProps {
  lumpReader?: LumpReader
  levelName?: string
  onChangeLevelName: (l: string) => void
}

export default function Selector({ lumpReader, levelName, onChangeLevelName }: SelectorProps) {
  const levels = useMemo(() => {
    if (!lumpReader) {
      return []
    }
    return lumpReader.listByType('level').map(({ name }) => name)
  }, [ lumpReader ])

  return (
    <Dropdown>
      <MenuButton
        variant='solid'
        color='primary'
        size='lg'
      >
        { levelName || 'Levels' }
      </MenuButton>
      <Menu>
        { levels.map(l =>
          <MenuItem
            key={l}
            onClick={_ => onChangeLevelName(l)}
          >
            { l }
          </MenuItem>,
        ) }
      </Menu>
    </Dropdown>
  )
}
