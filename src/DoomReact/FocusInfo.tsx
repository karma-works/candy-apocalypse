import { Card, CardContent, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';

export default function FocusInfo() {
  const defaultAltEscapeKey = 'Backquote'
  const [ altEscapeKey, setAltEscapeKey ] = useState(defaultAltEscapeKey)
  useEffect(() => {
    if (!navigator.keyboard) {
      return
    }
    navigator.keyboard.getLayoutMap().then(map => {
      setAltEscapeKey(map.get(defaultAltEscapeKey) || defaultAltEscapeKey)
    })
  }, [])

  return (
    <div className="FocusInfo">
      <Card>
        <CardContent>
          <Typography>
            When clicking on the game area,
            your cursor will be locked.
            Press <em>Esc</em> to release it.
          </Typography>
          <Typography>
            To ensure uninterrupted gameplay,
            the in-game <em>Esc</em> key (menu)
            is also accessible via the key directly below it
            (<em>Backtick</em> or <em>{ altEscapeKey }</em>)
          </Typography>
        </CardContent>
      </Card>
    </div>
  )
}
