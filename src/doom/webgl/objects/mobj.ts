import { AlwaysStencilFunc, Mesh, PlaneGeometry, ReplaceStencilOp } from 'three';
import { FF_FRAMEMASK, FF_FULLBRIGHT } from '../../play/sprite';
import { MObj as DoomMObj } from '../../play/mobj/mobj';
import { FRACUNIT } from '../../misc/fixed';
import { MObjFlag } from '../../play/mobj/mobj-flag';
import { SpritePaletteMaterial } from '../materials/sprite-palette-material';
import { TextureLoader } from '../texture-loader';
import { toRad } from '../../misc/table';

const geo = new PlaneGeometry(1, 1)
geo.translate(0, .5, 0)

export class MObj extends Mesh<PlaneGeometry, SpritePaletteMaterial> {
  static readonly RENDER_ORDER = 1

  renderOrder = MObj.RENDER_ORDER

  constructor(
    public mobj: DoomMObj,
    private textures: TextureLoader,
  ) {
    super(
      geo,
      new SpritePaletteMaterial({
        paletteMap: textures.paletteTexture,
      }),
    )

    this.material.stencilWrite = true
    this.material.stencilFunc = AlwaysStencilFunc
    this.material.stencilZPass = ReplaceStencilOp

    this.update(255)
  }

  dispose() {
    this.material.dispose()
  }

  update(lightLevel: number) {
    this.updatePosition();
    this.updateTexture(lightLevel);

    this.visible = true
  }

  private updatePosition() {
    const { y, z, x, angle } = this.mobj
    this.position.set(y / FRACUNIT, z / FRACUNIT, x / FRACUNIT)
    this.rotation.set(0, toRad(angle), 0)
  }

  private updateTexture(lightLevel: number) {
    const { sprite, frame, flags } = this.mobj
    const map = this.textures.getSpriteTexture(sprite)

    this.material.map = map
    this.material.rotations = map.rotations
    this.material.frames = map.frames
    this.material.frame = frame & FF_FRAMEMASK
    this.scale.set(map.width, map.height, map.width)
    this.position.y -= map.bottomOffset

    this.material.fuzz = !!(flags & MObjFlag.Shadow)

    this.material.lightLevel = frame & FF_FULLBRIGHT ? 255 : lightLevel
  }
}
