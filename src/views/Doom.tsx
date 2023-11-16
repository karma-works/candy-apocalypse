import './Doom.css'
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { Params } from '../doom/doom/params'
import { Doom as RawDoom } from '../doom/doom'

interface Inputs {
  params?: Partial<Params>,
}

export default function Doom({ params }: Inputs) {
  const [ fullscreen, setFullscreen ] = useState(false)
  const [ ratio, setRatio ] = useState(4/3)

  const screen2dRef = useRef<HTMLCanvasElement>(null)
  const screen3dRef = useRef<HTMLCanvasElement>(null)
  const screenRoot = useRef<HTMLDivElement>(null)

  const doomInstRef = useRef<RawDoom>()

  const start = useCallback(async() => {
    try {
      const screen2d = screen2dRef.current!
      const screen3d = screen3dRef.current!

      const doomInst = new RawDoom({
        input: screen2d,
        screen2d,
        screen3d,
        iwad: 'doom1.wad',
        ...params,
      })
      doomInstRef.current = doomInst

      await doomInst.init()

      setRatio(doomInst.iVideo.ratio)
    } catch (e) {
      console.error(e)
    }
  }, [ params ])

  const stop = useCallback(() => {
    if (doomInstRef.current) {
      doomInstRef.current.quit()
      doomInstRef.current = undefined
    }
  }, [])

  const registerFullScreenChange = useCallback(() => {
    const el = screenRoot.current!
    el.addEventListener('fullscreenchange', () => {
      setFullscreen(document.fullscreenElement === el)
    })
  }, [])

  useEffect(() => {
    start();
    registerFullScreenChange()

    return stop;
  }, [ start, registerFullScreenChange, stop ])

  return (
    <div className="screen-root" ref={screenRoot}>
      <div
        className={`screen-wrapper ${fullscreen ? 'fullscreen' : ''}`}
        style={{ '--ratio': ratio } as CSSProperties}
      >
        <canvas width="320" height="320" ref={screen3dRef}>
        </canvas>
        <canvas width="320" height="320" ref={screen2dRef}>
        </canvas>
      </div>
    </div>
  )
}
