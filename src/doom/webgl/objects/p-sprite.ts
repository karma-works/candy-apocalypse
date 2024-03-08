import { SCREENHEIGHT, SCREENWIDTH } from '../../global/doomdef';
import { FRACUNIT } from '../../misc/fixed';
import { OldSpritePaletteMaterial } from '../materials/old-sprite-palette-material';
import { PSpriteDef } from '../../play/sprite';
import { Sprite } from 'three';
import { TextureLoader } from '../texture-loader';

export class PSprite extends Sprite {
  constructor(
    private pSpriteDef: PSpriteDef,
    private textures: TextureLoader,
  ) {
    super(new OldSpritePaletteMaterial({ paletteMap: textures.paletteTexture }))

    this.center.set(0, 1)
  }

  update() {
    this.visible = true

    const state = this.pSpriteDef.state
    if (state === null) {
      return
    }

    const material = this.material as OldSpritePaletteMaterial

    const { map, alphaMap, patch } = this.textures.getSpriteDef(state.sprite, state.frame)

    material.map = map
    material.alphaMap = alphaMap

    this.scale.set(patch.width, patch.height, 1)

    this.position.x = this.pSpriteDef.sX / FRACUNIT - patch.leftOffset - SCREENWIDTH / 2
    this.position.y = -this.pSpriteDef.sY / FRACUNIT + patch.topOffset + SCREENHEIGHT
  }
}
