import {
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Uniform,
  WebGLProgramParametersWithUniforms,
} from "three";
import frag from "../shaders/sprite.frag.glsl";
import vert from "../shaders/sprite.vert.glsl";

export class SpritePaletteMaterial extends MeshBasicMaterial {
  get lightLevel() {
    return this.uLightLevel.value;
  }
  set lightLevel(lightLevel: number) {
    this.uLightLevel.value = lightLevel;
  }
  private uLightLevel = new Uniform(255);

  get frame() {
    return this.uFrame.value;
  }
  set frame(frame: number) {
    this.uFrame.value = frame;
  }
  private uFrame = new Uniform(0);

  get frames() {
    return this.uFrames.value;
  }
  set frames(frames: number) {
    this.uFrames.value = frames;
  }
  private uFrames = new Uniform(1);

  get rotations() {
    return this.uRotations.value;
  }
  set rotations(rotations: number) {
    this.uRotations.value = rotations;
  }
  private uRotations = new Uniform(8);

  transparent = true;

  constructor(parameters?: MeshBasicMaterialParameters) {
    super(parameters);
    this.alphaTest = 0.3;
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms): void {
    parameters.vertexShader = vert;
    parameters.fragmentShader = frag;

    parameters.uniforms.uLightLevel = this.uLightLevel;
    parameters.uniforms.uFrame = this.uFrame;
    parameters.uniforms.uFrames = this.uFrames;
    parameters.uniforms.uRotations = this.uRotations;
  }
}
