import { SpriteArray, SpriteLump } from './sprite-array'
import { SpriteFrame } from './sprite-frame'
import { sprNames } from './spr-names'

export interface SpriteDef {
  frames: SpriteFrame[]
}

export class SpriteDefsArray extends Array<SpriteDef> {
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(sprites?: SpriteArray, spriteNames = [ ...sprNames ]) {
    super(spriteNames.length)

    if (!sprites) {
      return
    }

    let sprName: string
    let sprite: SpriteLump

    let frames: Array<SpriteFrame>
    let frame: number
    let rotation: number

    for (let i = 0; i < sprNames.length; ++i) {
      sprName = sprNames[i]

      frames = []

      for (let j = 0; j < sprites.length; ++j) {
        sprite = sprites[j]
        if (sprite.name.startsWith(sprName)) {
          frame = sprite.name.charCodeAt(4) - 'A'.charCodeAt(0)
          rotation = sprite.name.charCodeAt(5) - '0'.charCodeAt(0)

          this.installSpriteLump(frames, j, sprName, frame, rotation, false)

          if (sprite.name.charAt(6)) {
            frame = sprite.name.charCodeAt(6) - 'A'.charCodeAt(0)
            rotation = sprite.name.charCodeAt(7) - '0'.charCodeAt(0)

            this.installSpriteLump(frames, j, sprName, frame, rotation, true)
          }

        }
      }

      for (frame = 0; frame < frames.length; ++frame) {
        const frameChar = String.fromCharCode('A'.charCodeAt(0) + frame)
        switch (frames[frame].rotate) {
        case -1:
          // no rotations were found for that frame at all
          throw `R_InitSprites: No patches found for ${sprName} frame ${frameChar}`
        case 0:
          // only the first rotation is needed
          break
        case 1:
          // must have all 8 frames
          for (rotation = 0; rotation < 8; ++rotation) {
            if (frames[frame].lump[rotation] === -1) {
              throw `R_InitSprites: Sprite ${sprName} frame ${frameChar} is missing rotations`
            }
          }
          break
        }
      }


      this[i] = {
        frames,
      }
    }

  }

  //
  // R_InstallSpriteLump
  // Local function for R_InitSprites.
  //
  installSpriteLump(frames: SpriteFrame[], lump: number, name: string,
    frame: number, rotation: number, flipped: boolean,
  ): void {

    if (frame >= 29 || rotation > 8) {
      throw `R_InstallSpriteLump: Bad frame characters in lump ${lump}`
    }

    if (!frames[frame]) {
      frames[frame] = new SpriteFrame()
    }

    const frameChar = String.fromCharCode('A'.charCodeAt(0) + frame)
    if (rotation === 0) {
      // the lump should be used for all rotations
      if (frames[frame].rotate === 0) {
        throw `R_InitSprites: Sprite ${name} frame ${frameChar} has multip rot=0 lump`
      }
      if (frames[frame].rotate === 1) {
        throw `R_InitSprites: Sprite ${name} frame ${frameChar} has rotations and a rot=0 lump`
      }

      frames[frame].rotate = 0
      for (let r = 0; r < 8; ++r) {
        frames[frame].lump[r] = lump
        frames[frame].flip[r] = flipped ? 1 : 0
      }
      return
    }

    // the lump is only used for one rotation
    if (frames[frame].rotate === 0) {
      throw `R_InitSprites: Sprite ${name} frame ${frameChar} has rotations and a rot=0 lump`
    }
    frames[frame].rotate = 1

    // make 0 based
    --rotation

    if (frames[frame].lump[rotation] !== -1) {
      throw `R_InitSprites: Sprite ${name} : ${frameChar} : ${rotation + 1} has two lumps mapped to it`
    }

    frames[frame].lump[rotation] = lump
    frames[frame].flip[rotation] = flipped ? 1 : 0
  }
}
