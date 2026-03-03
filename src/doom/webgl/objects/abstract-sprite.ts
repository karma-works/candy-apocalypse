import { FF_FRAMEMASK, FF_FULLBRIGHT } from "../../play/sprite";
import { Mesh, PlaneGeometry } from "three";
import { SpriteNum } from "../../doom/info/sprite-num";
import { SpritePaletteMaterial } from "../materials/sprite-palette-material";
import { TextureLoader } from "../texture-loader";

const geo = new PlaneGeometry(1, 1);
geo.translate(0, 0.5, 0);

export abstract class Sprite extends Mesh<
  PlaneGeometry,
  SpritePaletteMaterial
> {
  abstract sprite: SpriteNum;
  abstract frame: number;

  constructor(private textures: TextureLoader) {
    super(geo, new SpritePaletteMaterial());
  }

  dispose() {
    this.material.dispose();
  }

  update(lightLevel: number) {
    this.updatePosition();
    this.updateTexture(lightLevel);

    this.visible = true;
  }

  protected abstract updatePosition(): void;

  private updateTexture(lightLevel: number) {
    const { sprite, frame } = this;

    const map = this.textures.getSpriteTexture(sprite);

    this.material.map = map;
    this.material.rotations = map.rotations;
    this.material.frames = map.frames;
    this.material.frame = frame & FF_FRAMEMASK;
    this.scale.set(map.width, map.height, map.width);
    this.position.y -= map.bottomOffset;

    this.material.lightLevel = frame & FF_FULLBRIGHT ? 255 : lightLevel;
  }
}
