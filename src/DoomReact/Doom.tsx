import './Doom.css'
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EvType } from '../doom/doom/event';
import FocusInfo from './FocusInfo';
import { Params } from '../doom/doom/params'
import { Doom as RawDoom } from '../doom/doom'
import { ScanCode } from '../doom/interfaces/scancodes';
import { useAudio as useAudioContext } from '../AudioContext';
import { useSearchParams } from 'react-router-dom';

function useAudio() {
  const audioCtx = useAudioContext()
  const [ searchParams ] = useSearchParams();

  return useMemo(() => {
    return searchParams.has('sound') ? audioCtx : null
  }, [ audioCtx, searchParams ])
}

export default function Doom(props?: Partial<Params>) {
  const [ running, setRunning ] = useState(false)

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

  const audioCtx = useAudio()
  const updateSoundCtx = useCallback(() => {
    if (doomInstRef.current) {
      doomInstRef.current.iSound.audioCtx = audioCtx
    }
  }, [ audioCtx ])
  useEffect(updateSoundCtx, [ updateSoundCtx ])

  function onResize() {
    setCanvasStyle({
      width: window.innerWidth,
      height: window.innerHeight,
    })
    doomInstRef.current?.iVideo.setSize(window.innerWidth, window.innerHeight)
  }

  const onPointerLockChange = useCallback(() => {
    const running = document.pointerLockElement === inputRef.current
    setRunning(running)

    if (running) {
      inputRef.current?.focus()
    } else {
      // Propage missing KeyDown Escape event
      doomInstRef.current?.postEvent({
        type: EvType.KeyDown,
        data1: ScanCode.Escape,
        data2: 0,
        data3: 0,
      })
      onBlur()
    }
  }, [])

  function onFocus() {
    audioCtx?.resume()

    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.requestPointerLock()

      if (navigator.keyboard) {
        navigator.keyboard.lock()
      }
    }, 0)
    setRunning(true)
  }
  function onBlur() {
    setTimeout(() => {
      inputRef.current?.blur()
      if (navigator.keyboard) {
        navigator.keyboard.unlock()
      }
    }, 0)
    setRunning(false)
  }

  useEffect(() => {
    window.addEventListener('resize', onResize);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    }
  }, [ onPointerLockChange ]);

  useEffect(() => {
    start();
    updateSoundCtx()
    onResize()
    return stop;
  }, [ start, updateSoundCtx, stop ])

  return (
    <>
      <div
        className="screen-root"
        ref={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div className="screen-wrapper">
          <canvas ref={screen3dRef} style={canvasStyle}>
          </canvas>
          <canvas ref={screen2dRef} style={canvasStyle}>
          </canvas>
        </div>
      </div>

      { !running && <FocusInfo />}
    </>
  )
}
