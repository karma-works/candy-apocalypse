import "./Doom.css";
import {
  CSSProperties,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EvType } from "../doom/doom/event";
import FocusInfo from "./FocusInfo";
import { Params } from "../doom/doom/params";
import { Doom as RawDoom } from "../doom/doom";
import { ScanCode } from "../doom/interfaces/scancodes";
import { useAudio as useAudioContext } from "../AudioContext";
import { useSearchParams } from "react-router-dom";
import CandyHud from "./CandyHud";

export default function Doom(props?: Partial<Params>) {
  const inputRef = useRef<HTMLDivElement>(null);
  const screen2dRef = useRef<HTMLCanvasElement>(null);
  const screen3dRef = useRef<HTMLCanvasElement>(null);

  const doomInst = useDoomInst(inputRef, screen2dRef, screen3dRef, props);

  const canvasStyle = useCanvasResizer(doomInst);

  useAudioEnabler(doomInst, inputRef);

  const pointerLocked = usePointerLocker(doomInst, inputRef);

  return (
    <>
      <div className="screen-root" ref={inputRef}>
        <div className="screen-wrapper">
          <canvas ref={screen3dRef} style={canvasStyle}></canvas>
          <canvas ref={screen2dRef} style={canvasStyle}></canvas>
        </div>
        <CandyHud doomInst={doomInst} />
      </div>

      {!pointerLocked && <FocusInfo />}
    </>
  );
}

function useDoomInst(
  inputRef: RefObject<HTMLDivElement>,
  screen2dRef: RefObject<HTMLCanvasElement>,
  screen3dRef: RefObject<HTMLCanvasElement>,
  params: Partial<Params> = {},
) {
  const [doom, setDoom] = useState<RawDoom>();

  useEffect(() => {
    const input = inputRef.current!;
    const screen2d = screen2dRef.current!;
    const screen3d = screen3dRef.current!;

    const doomInst = new RawDoom({
      input,
      screen2d,
      screen3d,
      iwad: "doom1.wad",
      ...params,
    });
    setDoom(doomInst);
    doomInst.onError = console.error;
    try {
      /* await */ doomInst.init();
    } catch (e) {
      console.error(e);
    }

    return () => doomInst.quit();
  }, [params, inputRef, screen2dRef, screen3dRef]);

  return doom;
}

function useCanvasResizer(doomInst: RawDoom | undefined) {
  const [canvasStyle, setCanvasStyle] = useState<CSSProperties>({});

  const onResize = useCallback(() => {
    setCanvasStyle({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    doomInst?.iVideo.setSize(window.innerWidth, window.innerHeight);
  }, [doomInst]);

  useEffect(() => {
    onResize();

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  return canvasStyle;
}

function useAudioEnabler(
  doomInst: RawDoom | undefined,
  inputRef: RefObject<HTMLDivElement>,
) {
  const audioCtx = useAudioContext();
  const [searchParams] = useSearchParams();
  const hasSound = searchParams.has("sound");

  useEffect(() => {
    if (!hasSound || !doomInst) {
      return;
    }

    doomInst.iSound.audioCtx = audioCtx;

    const input = inputRef.current!;
    const onFocus = () => audioCtx.resume();
    input.addEventListener("focus", onFocus);
    return () => {
      doomInst.iSound.audioCtx = null;
      input.removeEventListener("focus", onFocus);
    };
  }, [audioCtx, doomInst, hasSound, inputRef]);
}

function usePointerLocker(
  doomInst: RawDoom | undefined,
  inputRef: RefObject<HTMLDivElement>,
) {
  const [pointerLocked, setPointerLocked] = useState(false);

  const onFocus = useCallback(() => {
    setTimeout(() => {
      inputRef.current!.focus();
      inputRef.current!.requestPointerLock();

      if (navigator.keyboard) {
        navigator.keyboard.lock();
      }
    }, 0);
    setPointerLocked(true);
  }, [inputRef]);

  const onBlur = useCallback(() => {
    setTimeout(() => {
      inputRef.current!.blur();
      if (navigator.keyboard) {
        navigator.keyboard.unlock();
      }
    }, 0);
    setPointerLocked(false);
  }, [inputRef]);

  const onPointerLockChange = useCallback(() => {
    const running = document.pointerLockElement === inputRef.current;
    setPointerLocked(running);

    if (running) {
      inputRef.current!.focus();
    } else {
      // Propage missing KeyDown Escape event
      doomInst?.postEvent({
        type: EvType.KeyDown,
        data1: ScanCode.Escape,
        data2: 0,
        data3: 0,
      });
      onBlur();
    }
  }, [doomInst, inputRef, onBlur]);

  useEffect(() => {
    const input = inputRef.current!;
    input.addEventListener("focus", onFocus);
    input.addEventListener("blur", onBlur);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("pointerlockerror", onBlur);
    return () => {
      input.removeEventListener("focus", onFocus);
      input.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("pointerlockerror", onBlur);
    };
  }, [inputRef, onBlur, onFocus, onPointerLockChange]);

  return pointerLocked;
}
