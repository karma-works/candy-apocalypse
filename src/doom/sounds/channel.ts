import { SfxInfo } from "./sfx-infos";
import { MObj } from "../../play/mobj/mobj";

export class Channel {
  // sound information (if null, channel avail.)
  sfxInfo: SfxInfo | null = null

  // origin of sound
  origin: MObj | null = null

  // handle of the sound being played
  handle = 0
}
