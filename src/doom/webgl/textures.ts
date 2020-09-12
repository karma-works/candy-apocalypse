import {
  DataTexture,
  NearestFilter,
  Object3D,
  RGBAFormat,
  RepeatWrapping,
} from 'three'
import { ANG45 } from '../misc/table'
import { FF_FRAMEMASK } from '../play/sprite'
import { FRACBITS } from '../misc/fixed'
import { Video as IVideo } from '../interfaces/video'
import { MObj } from '../play/mobj/mobj'
import { Palette } from '../interfaces/palette'
import { Patch } from '../rendering/defs/patch'
import { RANGE_CHECK } from '../global/doomdef'
import { Data as RData } from '../rendering/data'
import { Video as RVideo } from '../rendering/video'
import { Rendering } from './rendering'
import { pointToAngle } from '../misc/angle'

export class Textures {

  private patchCache: DataTexture[] = []
  private flipPatchCache: DataTexture[] = []
  private textureCache: DataTexture[] = []

  private get palette(): Palette {
    return this.rendering.iVideo.palette
  }
  private get rData(): RData {
    return this.rendering.rData
  }

  constructor(private rendering: Rendering) { }

  private createTextureFromPatch(patch: Patch, palette: Palette): DataTexture {
    const rVideo = new RVideo(patch.width, patch.height)
    rVideo.init(1)
    const iVideo = new IVideo(rVideo)
    iVideo.uploadNewPalette(palette)
    rVideo.drawPatch(patch.leftOffset, patch.topOffset, 0, patch)

    const data = new Uint8ClampedArray(patch.width * patch.height * 4)

    iVideo.drawInImageData(data)

    const t = new DataTexture(
      data,
      patch.width,
      patch.height,
      RGBAFormat,
    )

    t.flipY = true

    t.wrapS = RepeatWrapping
    t.wrapT = RepeatWrapping

    t.magFilter = NearestFilter

    return t
  }

  getTexture(num: number): DataTexture {
    const palette = this.palette
    num = this.rData.textures.getNum(num)

    if (!this.textureCache[num]) {
      const patch = this.rData.textures[num].patch
      this.textureCache[num] = this.createTextureFromPatch(patch, palette)
    }
    return this.textureCache[num]
  }

  getSprite(thing: MObj, pov: Object3D): DataTexture {
    const sprDef = this.rData.spriteDefs[thing.sprite]

    if (RANGE_CHECK) {
      if ((thing.frame & FF_FRAMEMASK) >= sprDef.frames.length) {
        throw `R_ProjectSprite: invalid sprite frame ${thing.sprite} : ${thing.frame} `
      }
    }

    const sprFrame = sprDef.frames[thing.frame & FF_FRAMEMASK]

    let lump: number
    let flip: boolean
    if (sprFrame.rotate) {
      // choose a different rotation based on player view
      const ang = pointToAngle(
        pov.position.x << FRACBITS, pov.position.y << FRACBITS,
        thing.x, thing.y)
      const rot = ang - thing.angle + ANG45 / 2 * 9 >>> 29
      lump = sprFrame.lump[rot]
      flip = !!sprFrame.flip[rot]
    } else {
      // use single rotation for all views
      lump = sprFrame.lump[0]
      flip = !!sprFrame.flip[0]
    }

    const sprite = this.rData.sprites[lump]
    const cache = flip ? this.flipPatchCache : this.patchCache
    if (!cache[sprite.lump]) {
      const palette = this.palette
      cache[sprite.lump] = this.createTextureFromPatch(
        sprite.patch, palette)

      if (flip) {
        cache[sprite.lump].repeat.set(-1, 1)
      }
    }

    return cache[sprite.lump]
  }
}
