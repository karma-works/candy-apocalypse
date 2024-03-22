import { Group } from 'three'
import { LIGHT_SEG_SHIFT } from '../rendering/rendering'
import { Things as LegacyThings } from '../rendering/things'
import { PSprite } from './objects/p-sprite'
import { PSpriteDef } from '../play/sprite'
import { PowerType } from '../global/doomdef'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { TextureLoader } from './texture-loader'
import { validCounter } from '../play/valid-counter'

export class Things extends LegacyThings {
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
    if (validCounter.check(sec)) {
      return
    }
    const lightLevel = sec.lightLevel + (this.rendering.extraLight << LIGHT_SEG_SHIFT)

    this.rendering.levelGroup?.updateLinkedThings(sec.id, sec.thingList, lightLevel)
  }

  clearSprites(): void {
    super.clearSprites()

    for (let i = this.pSpriteGroup.children.length - 1; i >= 0; --i) {
      this.pSpriteGroup.children[i].visible = false
    }
  }

  drawPSprite(psp: PSpriteDef): void {
    const name = `psprite-${psp.id}`
    let sprite = this.pSpriteGroup.getObjectByName(name) as PSprite
    if (!sprite) {
      sprite = new PSprite(psp, this.textures)
      sprite.name = name
      this.pSpriteGroup.add(sprite)
    }

    if (this.rendering.viewPlayer?.mo?.subSector?.sector === null ||
      this.rendering.viewPlayer?.mo?.subSector?.sector === undefined) {
      throw 'this.rendering.viewPlayer.mo.subSector.sector = null'
    }
    const powers = this.rendering.viewPlayer.powers
    sprite.fuzz = !!(powers[PowerType.Invisibility] > 4 * 32 ||
      powers[PowerType.Invisibility] & 8)

    const lightLevel =
      this.rendering.viewPlayer.mo.subSector.sector.lightLevel +
      (this.rendering.extraLight << LIGHT_SEG_SHIFT)

    sprite.update(lightLevel)
  }
}
