import {
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Uniform,
  WebGLProgramParametersWithUniforms,
} from 'three';
import { PaletteTexture } from '../textures/palette-texture';
import frag from '../shaders/sprite.frag.glsl'
import vert from '../shaders/sprite.vert.glsl'

export interface SpritePaletteMaterialParameters extends MeshBasicMaterialParameters {
  paletteMap: PaletteTexture
}

export class SpritePaletteMaterial extends MeshBasicMaterial {
  get paletteMap() {
    return this.uPaletteMap.value
  }
  set paletteMap(paletteMap: PaletteTexture) {
    this.uPaletteMap.value = paletteMap
  }
  private uPaletteMap: Uniform<PaletteTexture>

  // Light level from 0 to 255
  get lightLevel() {
    return this.uLightLevel.value
  }
  set lightLevel(lightLevel: number) {
    this.uLightLevel.value = lightLevel
  }
  private uLightLevel = new Uniform(255)

  // Num of the frame to display
  get frame() {
    return this.uFrame.value
  }
  set frame(frame: number) {
    this.uFrame.value = frame
  }
  private uFrame = new Uniform(0)

  // Number of frames available
  get frames() {
    return this.uFrames.value
  }
  set frames(frames: number) {
    this.uFrames.value = frames
  }
  private uFrames = new Uniform(1)

  // Number of rotations available
  get rotations() {
    return this.uRotations.value
  }
  set rotations(rotations: number) {
    this.uRotations.value = rotations
  }
  private uRotations = new Uniform(8)

  transparent = true
  alphaTest = 0.5

  constructor({ paletteMap, ...parameters }: SpritePaletteMaterialParameters) {
    super(parameters)
    this.uPaletteMap = new Uniform(paletteMap)
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms): void {
    parameters.vertexShader = vert
    parameters.fragmentShader = frag

    parameters.uniforms.paletteMap = this.uPaletteMap
    parameters.uniforms.uLightLevel = this.uLightLevel
    parameters.uniforms.uFrame = this.uFrame
    parameters.uniforms.uFrames = this.uFrames
    parameters.uniforms.uRotations = this.uRotations
  }
}
