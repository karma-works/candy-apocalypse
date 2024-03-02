import { PatchTextures, TextureLoader } from '../texture-loader';
import { MObj as DoomMObj } from '../../play/mobj/mobj';
import { FF_FRAMEMASK } from '../../play/sprite';
import { FRACBITS } from '../../misc/fixed';
import { Sprite } from 'three';
import { SpritePaletteMaterial } from '../materials/sprite-palette-material';
import { toRad } from '../../misc/table';

export class MObj extends Sprite {
  constructor(
    private mobj: DoomMObj,
    private textures: TextureLoader,
  ) {
    super(new SpritePaletteMaterial({
      paletteMap: textures.paletteTexture,
    }))

    this.geometry.computeVertexNormals()
    this.center.set(.5, 0)

    this.update(255)
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }

  update(lightLevel: number) {
    const { y, z, x, angle } = this.mobj
    this.position.set(y >> FRACBITS, z >> FRACBITS, x >> FRACBITS)
    this.rotation.set(0, toRad(angle), 0)

    const { sprite, frame } = this.mobj
    const sprDef = this.textures.spriteDefs[sprite]
    const sprFrame = sprDef.frames[frame & FF_FRAMEMASK]

    const material = (this.material as SpritePaletteMaterial)
    if (sprFrame.rotate === 1) {
      material.rotationMap = this.textures.getSpriteFrame(sprFrame) as PatchTextures[]
      material.map = null
      material.alphaMap = null
      this.scale.set(64, 64, 1)
    } else {
      const { map, alphaMap } = this.textures.getSpriteFrame(sprFrame) as PatchTextures
      material.map = map
      material.alphaMap = alphaMap
      material.rotationMap = null
      this.scale.set(map.image.width, map.image.height, 1)
    }

    material.lightLevel = lightLevel

    this.visible = true
  }
}
