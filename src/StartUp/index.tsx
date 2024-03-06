import { Button, Card, CardActions, CardContent, Divider, Grid, Typography } from '@mui/joy';
import { Form, useSubmit } from 'react-router-dom';
import AutoStartOptions from './AutoStartOptions';
import ConfigOptions from './ControlOptions';
import MiscOptions from './MiscOptions';
import RenderOptions from './RenderOptions';
import WadOptions from './WadOptions';
import { useAudio } from '../AudioContext';
import { useRef } from 'react';

export default function StartUp() {
  const submit = useSubmit()
  const form = useRef<HTMLFormElement>(null)

  const audioCtx = useAudio()

  return (
    <Grid
      container
      direction='column'
      alignItems='center'
    >
      <Grid sm={12} md={6}>
        <Card>
          <Form action="play" ref={form}>
            <Typography level="title-lg">
              Doom.ts
            </Typography>

            <Divider inset="none" />

            <CardContent>
              <Grid
                container
                alignItems="flex-end"
                justifyContent="center"
                spacing={2}
              >
                <WadOptions />
                <RenderOptions />
                <ConfigOptions />
                <AutoStartOptions />
                <MiscOptions />
              </Grid>
            </CardContent>

            <CardActions buttonFlex="1">
              <Button
                type="button"
                variant="outlined"
                onClick={_ => submit(form.current, { action: 'explorer' })}
              >
                Explore
              </Button>
              <Button
                type="submit"
                variant="solid"
                color="primary"
                onClick={_ => audioCtx.resume()}
              >
                Play
              </Button>
            </CardActions>
          </Form>
        </Card>
      </Grid>
    </Grid>
  )
}


