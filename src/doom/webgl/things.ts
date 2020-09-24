import {
  Group,
  Scene,
  Sprite,
  SpriteMaterial,
} from 'three'
import { FRACBITS } from '../misc/fixed'
import { Things as LegacyThings } from '../rendering/things'
import { Rendering } from './rendering'
import { Textures } from './textures'
import { VisSprite } from '../rendering/things/vis-sprite'

interface ThingItem {
  visSprite: VisSprite
  sprite: Sprite
}

export class Things extends LegacyThings {

  private things: ThingItem[] = []
  private group = new Group()

  get textures(): Textures {
    return this.rendering.textures
  }

  constructor(protected rendering: Rendering) {
    super(rendering)
  }

  drawSprite(spr: VisSprite): void {
    this.spawnThing(spr)
  }

  clearSprites(): void {
    super.clearSprites()
    for (let i = this.group.children.length; i >= 0; --i) {
      this.group.remove(this.group.children[i])
    }
  }

  reset(scene: Scene): void {
    this.things.length = 0
    scene.remove(this.group)

    this.group = new Group()
    scene.add(this.group)
  }

  private updateThing({ sprite, visSprite }: ThingItem): void {
    const map = this.textures.getSprite(visSprite)

    // y, z, x
    sprite.position.set(visSprite.gY >> FRACBITS, visSprite.gZ >> FRACBITS, visSprite.gX >> FRACBITS)

    sprite.material.map = map
    sprite.scale.set(map.image.width, map.image.height, 1)
  }

  private spawnThing(visSprite: VisSprite): ThingItem {
    const sprite = new Sprite(
      new SpriteMaterial(),
    )
    sprite.center.set(0.5, 0)

    this.group.add(sprite)

    const item: ThingItem = {
      visSprite,
      sprite,
    }

    this.updateThing(item)

    return item
  }
}
