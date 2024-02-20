import './Doom.css'
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { Params } from '../doom/doom/params'
import { Doom as RawDoom } from '../doom/doom'

export default function Doom(props?: Partial<Params>) {
  const [ canvasStyle, setCanvasStyle ] = useState<CSSProperties>({})
  const inputRef = useRef<HTMLDivElement>(null)
  const screen2dRef = useRef<HTMLCanvasElement>(null)
  const screen3dRef = useRef<HTMLCanvasElement>(null)

  const doomInstRef = useRef<RawDoom>()

  const start = useCallback(async() => {
    try {
      const input = inputRef.current!
      const screen2d = screen2dRef.current!
      const screen3d = screen3dRef.current!

      const doomInst = new RawDoom({
        input,
        screen2d,
        screen3d,
        iwad: 'doom1.wad',
        ...props,
      })
      doomInstRef.current = doomInst
      doomInst.onError = console.error

      await doomInst.init()
    } catch (e) {
      console.error(e)
    }
  }, [ props ])

  const stop = useCallback(() => {
    if (doomInstRef.current) {
      doomInstRef.current.quit()
      doomInstRef.current = undefined
    }
  }, [])

  const onResize = useCallback(() => {
    setCanvasStyle({
      width: window.innerWidth,
      height: window.innerHeight,
    })
    doomInstRef.current?.iVideo.setSize(window.innerWidth, window.innerHeight)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, [ onResize ]);

  useEffect(() => {
    start();
    onResize()
    return stop;
  }, [ start, onResize, stop ])

  return (
    <div className="screen-root" ref={inputRef}>
      <div className="screen-wrapper">
        <canvas ref={screen3dRef} style={canvasStyle}>
        </canvas>
        <canvas ref={screen2dRef} style={canvasStyle}>
        </canvas>
      </div>
    </div>
  )
}
