import { Checkbox, Grid } from '@mui/joy';
import { useLocalStorage } from '../useLocalStorage';

export default function MiscOptions() {
  const [ sound, setSound ] = useLocalStorage<boolean>('sound', false)
  const [ noMonsters, setNoMonsters ] = useLocalStorage<boolean>('noMonsters', false)
  const [ fast, setFast ] = useLocalStorage<boolean>('fast', false)
  const [ respawn, setRespawn ] = useLocalStorage<boolean>('respawn', false)

  return (
    <>
      <Grid xs={3}>
        <Checkbox
          checked={sound}
          onChange={(e) => setSound(e.target.checked) }
          name="sound"
          label='Sound'
        />
      </Grid>
      <Grid xs={3}>
        <Checkbox
          checked={noMonsters}
          onChange={(e) => setNoMonsters(e.target.checked) }
          name="noMonsters"
          label='No Monsters'
        />
      </Grid>
      <Grid xs={3}>
        <Checkbox
          checked={fast}
          disabled={noMonsters}
          onChange={(e) => setFast(e.target.checked) }
          name="fast"
          label='Fast Monsters'
        />
      </Grid>
      <Grid xs={3}>
        <Checkbox
          checked={respawn}
          disabled={noMonsters}
          onChange={(e) => setRespawn(e.target.checked) }
          name="respawn"
          label='Respawn Monsters'
        />
      </Grid>
    </>
  )
}
