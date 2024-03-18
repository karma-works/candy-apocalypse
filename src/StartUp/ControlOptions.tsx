import { Button, FormControl, FormLabel, Grid, Option, Select } from '@mui/joy';
import { DbFile, fs } from '../doom/system/fs';
import { useEffect, useState } from 'react';
import { useLocalStorage } from '../useLocalStorage';

export default function ConfigOptions() {
  const [ fileName, setFileName ] = useLocalStorage<string|null>('config', 'modern.cfg')
  const [ file, setFile ] = useState<DbFile|undefined>(undefined)

  useEffect(() => {
    async function fetchFile() {
      if (!fileName) {
        setFile(undefined)
        return
      }

      const file = await fs.stat(fileName)
      setFile(file)
    }
    fetchFile()
  }, [ fileName ])

  function reset() {
    fs.rm(fileName!)
    setFile(undefined)
  }

  return (
    <>
      <Grid xs={10}>
        <FormControl>
          <FormLabel>Configuration</FormLabel>
          <Select
            name="config"
            value={fileName}
            onChange={(_, v) => setFileName(v)}
          >
            <Option value="default.cfg">Default</Option>
            <Option value="modern.cfg">Modern controls</Option>
          </Select>
        </FormControl>
      </Grid>
      <Grid xs={2}>
        <Button
          disabled={file?.type !== 'buffer'}
          onClick={reset}
        >
          Reset
        </Button>
      </Grid>
    </>
  )
}
