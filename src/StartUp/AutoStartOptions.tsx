import { FormControl, FormLabel, Grid, Input, Option, Select, Switch } from '@mui/joy';
import { Skill } from '../doom/doom/mode';
import { useState } from 'react';

export default function AutoStartOptions() {
  const [ autoStart, setAutoStart ] = useState(false)

  const skills = [
    { text: 'Baby', value: Skill.Baby },
    { text: 'Easy', value: Skill.Easy },
    { text: 'Medium', value: Skill.Medium },
    { text: 'Hard', value: Skill.Hard },
    { text: 'Nightmare', value: Skill.Nightmare },
  ].map(({ text, value }) => <Option value={value} key={value}>{text}</Option>)

  return (
    <>
      <Grid xs={3}>
        <Switch
          checked={autoStart}
          onChange={(e) => setAutoStart(e.target.checked) }
          endDecorator='Auto Start'
        />
      </Grid>
      <Grid xs={3}>
        <FormControl>
          <FormLabel>Episode</FormLabel>
          <Input
            name="episode"
            type="number"
            disabled={!autoStart}
          />
        </FormControl>
      </Grid>
      <Grid xs={3}>
        <FormControl>
          <FormLabel>Map</FormLabel>
          <Input
            name="map"
            type="number"
            disabled={!autoStart}
          />
        </FormControl>
      </Grid>
      <Grid xs={3}>
        <FormControl>
          <FormLabel>Difficulty</FormLabel>
          <Select
            name="skill"
            disabled={!autoStart}
          >
            {skills}
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}
