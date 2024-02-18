import {
  Group,
  Scene,
  Sprite,
} from 'three'
import { FRACBITS } from '../misc/fixed'
import { Things as LegacyThings } from '../rendering/things'
import { Rendering } from './rendering'
import { SpritePaletteMaterial } from './materials/sprite-palette-material'
import { Textures } from './textures'
import { VisSprite } from '../rendering/things/vis-sprite'

export class Things extends LegacyThings {
  private spriteCache: {[id: number]: Sprite} = {}
  private group = new Group()

  get textures(): Textures {
    return this.rendering.textures
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
  }

  reset(scene: Scene): void {
    Object.values(this.spriteCache).forEach((sprite) =>
      sprite.material.dispose())

    this.spriteCache = {}
    scene.remove(this.group)

    this.group = new Group()
    scene.add(this.group)
  }

  private updateThing(sprite: Sprite, visSprite: VisSprite): void {
    const [ map, alphaMap ] = this.textures.getSprite(visSprite)

    // y, z, x
    sprite.position.set(visSprite.gY >> FRACBITS, visSprite.gZ >> FRACBITS, visSprite.gX >> FRACBITS)

    const material = (sprite.material as SpritePaletteMaterial)
    material.map = map
    material.alphaMap = alphaMap;

    material.paletteTexture.palette = this.textures.palette

    if (visSprite.colorMap) {
      material.paletteTexture.colorMap = visSprite.colorMap
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
        new SpritePaletteMaterial(),
      )
      sprite.center.set(0.5, 0)

      this.group.add(sprite)

      this.spriteCache[visSprite.id] = sprite
    } else {
      sprite = this.spriteCache[visSprite.id]
    }
    this.updateThing(sprite, visSprite)
  }
}
