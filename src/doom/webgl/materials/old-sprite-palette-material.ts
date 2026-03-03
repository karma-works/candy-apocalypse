import {
  SpriteMaterial,
  SpriteMaterialParameters,
  Uniform,
  WebGLProgramParametersWithUniforms,
} from "three";
import frag from "../shaders/oldsprite.frag.glsl";
import vert from "../shaders/oldsprite.vert.glsl";

export class OldSpritePaletteMaterial extends SpriteMaterial {
  get lightLevel() {
    return this._lightLevel.value;
  }
  set lightLevel(lightLevel: number) {
    this._lightLevel.value = lightLevel;
  }
  private _lightLevel = new Uniform(255);

  transparent = true;

  constructor(parameters?: SpriteMaterialParameters) {
    super(parameters);
    this.alphaTest = 0.5;
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms): void {
    shader.vertexShader = vert;
    shader.fragmentShader = frag;

    shader.uniforms.uLightLevel = this._lightLevel;
  }
}
