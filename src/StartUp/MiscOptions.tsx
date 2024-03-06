import { Checkbox, Grid } from '@mui/joy';
import { useLocalStorage } from '../useLocalStorage';

export default function MiscOptions() {
  const [ sound, setSound ] = useLocalStorage<boolean>('sound', false)

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
      <Grid xs={9} />
    </>
  )
}
