import { FormControl, FormLabel, Grid, Input, Option, Select, Switch } from '@mui/joy';
import { Skill } from '../doom/doom/mode';
import { useLocalStorage } from '../useLocalStorage';

export default function AutoStartOptions() {
  const [ autoStart, setAutoStart ] = useLocalStorage<boolean>('autostart', false)
  const [ episode, setEpisode ] = useLocalStorage<number>('episode', 1)
  const [ map, setMap ] = useLocalStorage<number>('map', 1)
  const [ skill, setSkill ] = useLocalStorage<number|null>('skill', Skill.Medium)

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
            value={episode}
            onChange={(ev) => setEpisode(ev.target.valueAsNumber)}
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
            value={map}
            onChange={(ev) => setMap(ev.target.valueAsNumber)}
          />
        </FormControl>
      </Grid>
      <Grid xs={3}>
        <FormControl>
          <FormLabel>Difficulty</FormLabel>
          <Select
            name={autoStart ? 'skill' : undefined}
            disabled={!autoStart}
            value={skill}
            onChange={(_, v) => setSkill(v)}
          >
            {skills}
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}
