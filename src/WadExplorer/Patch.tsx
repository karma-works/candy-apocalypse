import { useEffect, useMemo, useRef } from "react";
import { Patch as DoomPatch } from "../doom/rendering/defs/patch";
import { Video as RVideo, drawInImageData } from "../doom/rendering/video";
import { Palettes } from "../doom/interfaces/palette";
import { useLumpReader } from "./WadContext";

interface PatchProps {
  lump: string | number;
}

export default function Patch({ lump }: PatchProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const palette = usePalette();
  const patch = usePatch(lump);

  useEffect(() => {
    if (!patch || !palette || !canvas.current) {
      return;
    }

    const rVideo = new RVideo({ logical: [patch.width, patch.height] });
    rVideo.init(1);

    rVideo.drawPatch(patch.leftOffset, patch.topOffset, 0, patch);

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(patch.width, patch.height);
    drawInImageData(rVideo.screens[0], imageData.data, palette, 0, true);
    ctx.putImageData(imageData, 0, 0);
  }, [patch, palette]);

  return (
    <canvas ref={canvas} width={patch?.width} height={patch?.height}></canvas>
  );
}

function usePalette() {
  const lumpReader = useLumpReader();
  return useMemo(() => {
    if (!lumpReader.numLumps) {
      return undefined;
    }

    return lumpReader.cacheLumpName(Palettes.DEFAULT_LUMP, Palettes).p[0];
  }, [lumpReader]);
}

function usePatch(lump: string | number) {
  const lumpReader = useLumpReader();
  return useMemo(() => {
    if (!lumpReader.numLumps) {
      return undefined;
    }

    if (typeof lump === "number") {
      return lumpReader.cacheLumpNum(lump, DoomPatch);
    }
    return lumpReader.cacheLumpName(lump, DoomPatch);
  }, [lump, lumpReader]);
}
