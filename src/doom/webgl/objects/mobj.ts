import { AlwaysStencilFunc, ReplaceStencilOp } from "three";
import { MObj as DoomMObj } from "../../play/mobj/mobj";
import { FRACUNIT } from "../../misc/fixed";
import { Sprite } from "./abstract-sprite";
import { TextureLoader } from "../texture-loader";
import { toRad } from "../../misc/table";

export class MObj extends Sprite {
  static readonly RENDER_ORDER = 1;

  renderOrder = MObj.RENDER_ORDER;

  get sprite() {
    return this.mobj.sprite;
  }
  get frame() {
    return this.mobj.frame;
  }

  constructor(
    public mobj: DoomMObj,
    textures: TextureLoader,
  ) {
    super(textures);

    this.material.stencilWrite = true;
    this.material.stencilFunc = AlwaysStencilFunc;
    this.material.stencilZPass = ReplaceStencilOp;

    this.update(255);
  }

  protected updatePosition() {
    const { y, z, x, angle } = this.mobj;
    this.position.set(y / FRACUNIT, z / FRACUNIT, x / FRACUNIT);
    this.rotation.set(0, toRad(angle), 0);
  }
}
