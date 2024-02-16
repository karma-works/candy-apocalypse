import { Button, Card, CardActions, CardContent, Divider, Grid, Typography } from '@mui/joy';
import ConfigOptions from './ControlOptions';
import { Form } from 'react-router-dom';
import RenderOptions from './RenderOptions';

export default function StartUp() {
  return (
    <Grid
      container
      direction='column'
      alignItems='center'
    >
      <Grid sm={12} md={6}>
        <Card>
          <Form action="play">
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
                <RenderOptions />
                <ConfigOptions />
              </Grid>
            </CardContent>

            <CardActions>
              <Button
                type="submit"
                variant="solid"
                color="primary"
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


