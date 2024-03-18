import {
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Uniform,
  Vector2,
  WebGLProgramParametersWithUniforms,
} from 'three';
import { PaletteTexture } from '../textures/palette-texture';
import frag from '../shaders/seg.frag.glsl'
import vert from '../shaders/seg.vert.glsl'

export interface SegMaterialParameters extends MeshBasicMaterialParameters {
  paletteMap: PaletteTexture
}

export class SegMaterial extends MeshBasicMaterial {
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

  get texOffset() {
    return this.uTexOffset.value
  }
  private uTexOffset = new Uniform(new Vector2())

  get texSize() {
    return this.uTexSize.value
  }
  private uTexSize = new Uniform(new Vector2())

  alphaTest = 0.9

  constructor({ paletteMap, ...parameters }: SegMaterialParameters) {
    super(parameters)
    this.uPaletteMap = new Uniform(paletteMap)
    this.defines = this.defines || {}
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms): void {
    parameters.vertexShader = vert
    parameters.fragmentShader = frag

    parameters.uniforms.paletteMap = this.uPaletteMap
    parameters.uniforms.uLightLevel = this.uLightLevel
    parameters.uniforms.uTexOffset = this.uTexOffset
    parameters.uniforms.uTexSize = this.uTexSize
  }
}
