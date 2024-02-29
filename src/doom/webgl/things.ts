import {
  Group,
  Sprite,
} from 'three'
import { FRACBITS } from '../misc/fixed'
import { Things as LegacyThings } from '../rendering/things'
import { PSprite } from './objects/p-sprite'
import { PSpriteDef } from '../play/sprite'
import { PaletteTexture } from './textures/palette-texture'
import { Rendering } from './rendering'
import { SpritePaletteMaterial } from './materials/sprite-palette-material'
import { TextureLoader } from './texture-loader'
import { VisSprite } from '../rendering/things/vis-sprite'

export class Things extends LegacyThings {
  private spriteCache: {[id: number]: Sprite} = {}
  private group = new Group()

  get textures(): TextureLoader {
    return this.rendering.textures
  }

  get pSpriteGroup(): Group {
    return this.rendering.pSpritesGroup
  }

  constructor(protected rendering: Rendering, width: number) {
    super(rendering, width)
  }

  drawSprite(spr: VisSprite): void {
    this.spawnThing(spr)
  }

  clearSprites(): void {
    super.clearSprites()
    for (let i = this.group.children.length - 1; i >= 0; --i) {
      this.group.children[i].visible = false
    }

    for (let i = this.pSpriteGroup.children.length - 1; i >= 0; --i) {
      this.pSpriteGroup.children[i].visible = false
    }
  }

  reset(): Group {
    Object.values(this.spriteCache).forEach((sprite) => {
      const mat = sprite.material as SpritePaletteMaterial
      mat.paletteMap.dispose()
      mat.dispose()
    })

    this.spriteCache = {}

    this.group = new Group()
    return this.group
  }

  private updateThing(sprite: Sprite, visSprite: VisSprite): void {
    const { map, alphaMap } = this.textures.getSprite(visSprite)

    // y, z, x
    sprite.position.set(visSprite.gY >> FRACBITS, visSprite.gZ >> FRACBITS, visSprite.gX >> FRACBITS)

    const material = (sprite.material as SpritePaletteMaterial)
    material.map = map
    material.alphaMap = alphaMap;

    material.paletteMap.palette = this.textures.paletteTexture.palette

    if (visSprite.colorMap) {
      material.paletteMap.colorMap = visSprite.colorMap
    } else {
      // TODO: fuzz
    }

    sprite.scale.set(map.image.width, map.image.height, 1)
    sprite.visible = true
  }

  private spawnThing(visSprite: VisSprite) {
    let sprite: Sprite
    if (!this.spriteCache[visSprite.id]) {
      sprite = new Sprite(
        new SpritePaletteMaterial({
          paletteMap: new PaletteTexture(
            this.textures.paletteTexture.palette,
            this.textures.paletteTexture.colorMap,
          ),
        }),
      )
      sprite.center.set(0.5, 0)

      this.group.add(sprite)

      this.spriteCache[visSprite.id] = sprite
    } else {
      sprite = this.spriteCache[visSprite.id]
    }
    this.updateThing(sprite, visSprite)
  }

  drawPSprite(psp: PSpriteDef): void {
    const name = `psprite-${psp.id}`
    let sprite = this.pSpriteGroup.getObjectByName(name)
    if (!sprite) {
      sprite = new PSprite(psp, this.textures)
      sprite.name = name
      this.pSpriteGroup.add(sprite)
    }
    (sprite as PSprite).update()
  }
}
