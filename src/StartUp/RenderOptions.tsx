import { FormControl, FormLabel, Grid, Option, Select } from '@mui/joy';

export default function RenderOptions() {
  return (
    <Grid xs={12}>
      <FormControl>
        <FormLabel>Renderer</FormLabel>
        <Select name="renderer">
          <Option value="legacy">Legacy</Option>
          <Option value="webgl">WebGL (Three.js)</Option>
        </Select>
      </FormControl>
    </Grid>
  );
}
