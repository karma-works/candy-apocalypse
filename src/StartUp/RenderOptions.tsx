import { FormControl, FormLabel, Option, Select } from '@mui/joy';

export default function RenderOptions() {
  return (
    <FormControl>
      <FormLabel>Renderer</FormLabel>
      <Select name="renderer">
        <Option value="legacy">Legacy</Option>
        <Option value="webgl">WebGL (Three.js)</Option>
      </Select>
    </FormControl>
  );
}
