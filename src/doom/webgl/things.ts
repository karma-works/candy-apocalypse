import {
  Group,
  Object3D,
  Scene,
  Sprite,
  SpriteMaterial,
} from 'three'
import { FRACBITS } from '../misc/fixed'
import { MObj } from '../play/mobj/mobj'
import { MObjHandler } from '../play/mobj-handler'
import { Rendering } from './rendering'
import { Textures } from './textures'
import { Tick } from '../play/tick'

interface ThingItem {
  thing: MObj
  sprite: Sprite
}

export class Things {

  private things: ThingItem[] = []
  private pov = new Object3D()
  private group = new Group()

  private get mObjHandler(): MObjHandler {
    return this.rendering.play.mObjHandler
  }
  private get textures(): Textures {
    return this.rendering.textures
  }
  private get tick(): Tick {
    return this.rendering.play.tick
  }

  constructor(private rendering: Rendering) { }

  reset(scene: Scene, pov: Object3D): void {
    this.pov = pov

    this.things.length = 0
    scene.remove(this.group)

    this.group = new Group()
    scene.add(this.group)
  }

  refresh(): void {
    let i = 0
    let m: MObj | null = null
    for (let thinker = this.tick.thinkerCap.next;
      thinker !== null && thinker !== this.tick.thinkerCap;
      thinker = thinker.next
    ) {
      // not a mobj
      if (thinker.func !== this.mObjHandler.thinker) {
        continue
      }

      m = thinker as MObj

      while (this.things[i] && this.things[i].thing !== m) {
        this.removeThing(this.things.splice(i, 1)[0])
      }

      if (this.things[i]) {
        this.updateThing(this.things[i++])
      } else {
        this.things[i++] = this.spawnThing(m)
      }
    }

    while (this.things[i] && this.things[i].thing !== m) {
      this.removeThing(this.things.splice(i, 1)[0])
    }
  }

  private updateThing({ sprite, thing }: ThingItem): void {
    const map = this.textures.getSprite(thing, this.pov)

    sprite.position.set(thing.x >> FRACBITS, thing.y >> FRACBITS, thing.z >> FRACBITS)

    sprite.material.map = map
    sprite.scale.set(map.image.width, map.image.height, 1)
  }

  private spawnThing(thing: MObj): ThingItem {
    const sprite = new Sprite(
      new SpriteMaterial(),
    )
    sprite.center.set(0.5, 0)

    this.group.add(sprite)

    const item: ThingItem = {
      thing,
      sprite,
    }

    this.updateThing(item)

    return item
  }

  private removeThing({ sprite }: ThingItem): void {
    this.group.remove(sprite)
  }
}
