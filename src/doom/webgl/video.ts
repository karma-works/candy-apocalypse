import {
  Camera,
  DataTexture,
  Group,
  LinearFilter,
  OrthographicCamera,
  RedFormat,
  Scene,
  Sprite,
  Vector4,
  WebGLRenderer,
} from "three";
import { SCREENHEIGHT, STRETCH } from "../global/doomdef";
import { OldSpritePaletteMaterial } from "./materials/old-sprite-palette-material";
import { Palette } from "../interfaces/palette";
import { Video as RVideo } from "../rendering/video";
import { VideoInterface } from "../interfaces/video-interface";

export class Video implements VideoInterface {
  width = 0;
  height = 0;

  gamma = 0;

  screen: HTMLCanvasElement | null = null;
  renderer: WebGLRenderer | null = null;
  scene = new Scene();
  camera: Camera | null = null;
  viewport = new Vector4();
  private scaledViewport = new Vector4();

  pSpritesGroup = new Group();

  overlayScene = new Scene();
  overlayCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 50);
  overlayScreenMap: DataTexture | null = null;
  overlayAlphaMap: DataTexture | null = null;
  overlayMaterial: OldSpritePaletteMaterial | null = null;
  private overlayViewport = new Vector4();

  constructor(private rVideo: RVideo) {}

  finishUpdate(): void {
    if (this.renderer === null) {
      return;
    }
    if (this.camera !== null) {
      this.renderer.setViewport(this.scaledViewport);
      this.renderer.render(this.scene, this.camera);
    }

    if (this.overlayScreenMap !== null && this.overlayAlphaMap !== null) {
      this.overlayScreenMap.needsUpdate = true;
      this.overlayAlphaMap.needsUpdate = true;
      this.renderer.setViewport(this.overlayViewport);
      this.renderer.clearDepth();
      this.renderer.render(this.overlayScene, this.overlayCamera);
    }
  }

  private _palette = new Palette();
  public get palette(): Palette {
    return this._palette;
  }
  public set palette(p: Palette) {
    this._palette = p;
  }

  private firstTime = true;

  init(): void {
    if (!this.firstTime) {
      return;
    }
    if (this.screen === null) {
      throw "no screen defined";
    }
    this.firstTime = false;

    this.createOverlay();

    this.renderer = new WebGLRenderer({
      canvas: this.screen,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    this.setSize(this.width, this.height);
  }

  setSize(width: number = this.width, height: number = this.height) {
    this.width = width;
    this.height = height;
    this.renderer?.setSize(width, height / STRETCH, false);

    const destWidth = width;
    const destHeight = height / STRETCH;

    const sourceRatio = this.rVideo.width / this.rVideo.height;
    const destRatio = destWidth / destHeight;

    let scaledWidth;
    let scaledHeight;
    if (sourceRatio > destRatio) {
      scaledWidth = destWidth;
      scaledHeight = destWidth / sourceRatio;
    } else {
      scaledHeight = destHeight;
      scaledWidth = destHeight * sourceRatio;
    }

    const x = (destWidth - scaledWidth) / 2;
    const y = (destHeight - scaledHeight) / 2;

    this.overlayViewport.set(x, y, scaledWidth, scaledHeight);

    this.scaledViewport.copy(this.viewport);
    this.scaledViewport.multiplyScalar(scaledWidth / this.rVideo.width);

    this.scaledViewport.x += x;
    this.scaledViewport.y += y;

    this.pSpritesGroup.scale.set(
      this.viewport.z / 320,
      this.viewport.z / 320,
      1,
    );
    this.pSpritesGroup.position.set(0, 0, -40);
  }

  private createOverlay() {
    const { width, height } = this.rVideo;

    this.overlayCamera.left = -width / 2;
    this.overlayCamera.right = width / 2;
    this.overlayCamera.top = height;
    this.overlayCamera.bottom = 0;
    this.overlayCamera.updateProjectionMatrix();

    const data = this.rVideo.screens[0];
    this.overlayScreenMap = new DataTexture(
      data.buffer as ArrayBuffer,
      data.width,
      data.height,
      RedFormat,
    );
    this.overlayScreenMap.flipY = true;
    this.overlayScreenMap.magFilter = LinearFilter;
    this.overlayScreenMap.minFilter = LinearFilter;

    const alpha = data.alpha;
    this.overlayAlphaMap = new DataTexture(
      alpha.buffer as ArrayBuffer,
      data.width,
      data.height,
      RedFormat,
    );
    this.overlayAlphaMap.flipY = true;
    this.overlayAlphaMap.magFilter = LinearFilter;
    this.overlayAlphaMap.minFilter = LinearFilter;

    this.overlayMaterial = new OldSpritePaletteMaterial({
      map: this.overlayScreenMap,
      alphaMap: this.overlayAlphaMap,
    });
    const sprite = new Sprite(this.overlayMaterial);
    sprite.scale.set(data.width, data.height, 1);
    sprite.position.set(0, 0, -1);
    sprite.center.set(0.5, 0);

    this.overlayScene.add(sprite);

    this.overlayScene.add(this.pSpritesGroup);
  }

  quit(): void {
    if (this.screen === null || this.renderer === null) {
      return;
    }

    this.overlayScreenMap?.dispose();
    this.overlayAlphaMap?.dispose();
    this.overlayMaterial?.dispose();

    this.scene.clear();
    this.overlayScene.clear();
    this.pSpritesGroup.clear();

    this.renderer.dispose();
    this.renderer.forceContextLoss();

    this.renderer = null;
    this.screen = null;
  }
}
