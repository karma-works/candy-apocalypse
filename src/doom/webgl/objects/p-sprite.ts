import { SCREENHEIGHT, SCREENWIDTH } from '../../global/doomdef';
import { FRACUNIT } from '../../misc/fixed';
import { MObjFlag } from '../../play/mobj/mobj-flag';
import { PSpriteDef } from '../../play/sprite';
import { Sprite } from './abstract-sprite';
import { TextureLoader } from '../texture-loader';

export class PSprite extends Sprite {

  get sprite() {
    return this.pSpriteDef.state?.sprite || 0
  }
  get frame() {
    return this.pSpriteDef.state?.frame || 0
  }
  get flags() {
    return this.fuzz ? MObjFlag.Shadow : MObjFlag.Undefined
  }

  fuzz = false

  constructor(
    private pSpriteDef: PSpriteDef,
    textures: TextureLoader,
  ) {
    super(textures)
  }

  protected updatePosition() {
    this.position.x = this.pSpriteDef.sX / FRACUNIT - SCREENWIDTH / 2
    this.position.y = -this.pSpriteDef.sY / FRACUNIT + SCREENHEIGHT
  }
}
