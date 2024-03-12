import { FormControl, FormLabel, Grid, Option, Select } from '@mui/joy';
import { useLocalStorage } from '../useLocalStorage';

export default function RenderOptions() {
  const [ renderer, setRenderer ] = useLocalStorage<string|null>('renderer', 'webgl')

  return (
    <Grid xs={12}>
      <FormControl>
        <FormLabel>Renderer</FormLabel>
        <Select
          name="renderer"
          value={renderer}
          onChange={(_, v) => setRenderer(v)}
        >
          <Option value="legacy">Legacy</Option>
          <Option value="webgl">WebGL (Three.js)</Option>
        </Select>
      </FormControl>
    </Grid>
  );
}
