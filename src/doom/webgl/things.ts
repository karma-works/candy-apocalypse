import { MObj as DoomMObj } from '../play/mobj/mobj'
import { Group } from 'three'
import { LIGHT_SEG_SHIFT } from '../rendering/rendering'
import { Things as LegacyThings } from '../rendering/things'
import { MObj } from './objects/mobj'
import { PSprite } from './objects/p-sprite'
import { PSpriteDef } from '../play/sprite'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { SpritePaletteMaterial } from './materials/sprite-palette-material'
import { TextureLoader } from './texture-loader'

export class Things extends LegacyThings {
  private spriteCache: {[id: number]: MObj} = {}
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

  addSprites(sec: Sector): void {
    if (sec.validCount === this.play.validCount) {
      return
    }
    sec.validCount = this.play.validCount

    const lightLevel = sec.lightLevel + (this.rendering.extraLight << LIGHT_SEG_SHIFT)

    for (let thing = sec.thingList; thing; thing = thing.sNext) {
      this.addSprite(thing, lightLevel)
    }
  }

  private addSprite(thing: DoomMObj, lightLevel: number): void {
    let sprite: MObj
    if (!this.spriteCache[thing.id]) {
      sprite = new MObj(thing, this.textures)

      this.group.add(sprite)

      this.spriteCache[thing.id] = sprite
    } else {
      sprite = this.spriteCache[thing.id]
    }

    sprite.update(lightLevel)
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
