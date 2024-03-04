import './WadOptions.css'
import { Button, Grid, Link, Option, Select, Typography } from '@mui/joy';
import { ChangeEvent, useEffect, useState } from 'react';
import { fs } from '../doom/system/fs';
import { useLocalStorage } from '../useLocalStorage';

export default function WadOptions() {
  const [ iwad, setIwad ] = useLocalStorage<string|null>('iwad', 'doom1.wad')
  const [ wads, setWads ] = useState<string[]>([])
  const [ v, setV ] = useState(0)

  useEffect(() => {
    async function fetchWad() {
      const list = (await fs.ls())
        .filter(fi => fi.name.toLowerCase().endsWith('.wad'))
        .map(({ name }) => name)

      if (!list.includes('doom1.wad')) {
        list.push('doom1.wad')
      }

      setWads(list)
    }
    fetchWad()
  }, [ v ])

  async function upload(ev: ChangeEvent<HTMLInputElement>) {
    if (!ev.target.files || ev.target.files.length <= 0) {
      return
    }

    const file = ev.target.files[0]
    const buf = await file.arrayBuffer()
    await fs.write(file.name, buf)
    setV(v => v+1)
    setIwad(file.name)
  }

  return (
    <>
      <Grid xs={12}>
        <Disclaimer />
      </Grid>

      <Grid xs={8}>
        <Select
          name="iwad"
          value={iwad}
          onChange={(_, v) => setIwad(v)}
        >
          { wads.map(w => <Option value={w} key={w}>
            { w }
          </Option>) }
        </Select>
      </Grid>
      <Grid xs={4}>
        <Button
          component="label"
          className="WadOptions-UploadButton"
        >
          Upload IWAD
          <input
            type="file"
            onChange={upload}
          />
        </Button>
      </Grid>
    </>
  )
}

function Disclaimer() {
  const [ more, setMore ] = useState(false)
  return (
    <>
      <Typography level="body-md">
        To enjoy this DOOM port, you'll need an <strong>IWAD</strong> file.
        For your convenience, the original Shareware version
        of <strong>DOOM v1.9</strong>, developed by <em>id Software</em>, is
        included with this port.
      </Typography>

      {
        !more ? <Link onClick={_ => setMore(true)}>More…</Link> :
          <>
            <Typography level="body-md">
          If you possess another compatible version of DOOM, you are welcome
          to import the IWAD file yourself.
          These files will not be uploaded online, they are read parsed locally on your device.
            </Typography>
            <Typography level="body-md">
          Various versions of IWAD files can be found <Link
                href="https://archive.org/details/2020_03_22_DOOM"
                target="_blank"
              >on this page on the Internet Archive</Link>.
          I strongly recommend reviewing the terms of use on archive.org before
          downloading any files.
            </Typography>
          </>
      }

    </>
  )
}
