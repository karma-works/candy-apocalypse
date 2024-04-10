import { SpriteMaterial, SpriteMaterialParameters, Uniform, WebGLProgramParametersWithUniforms } from 'three'
import { PaletteTexture } from '../textures/palette-texture'
import frag from '../shaders/oldsprite.frag.glsl'
import vert from '../shaders/oldsprite.vert.glsl'

export interface OldSpritePaletteMaterialParameters extends SpriteMaterialParameters {
  paletteMap: PaletteTexture
}

export class OldSpritePaletteMaterial extends SpriteMaterial {
  get paletteMap() {
    return this._paletteMap.value
  }
  set paletteMap(paletteMap: PaletteTexture) {
    this._paletteMap.value = paletteMap
  }
  private _paletteMap: Uniform<PaletteTexture>

  // Light level from 0 to 255
  get lightLevel() {
    return this._lightLevel.value
  }
  set lightLevel(lightLevel: number) {
    this._lightLevel.value = lightLevel
  }
  private _lightLevel = new Uniform(255)

  transparent = true

  constructor({ paletteMap, ...parameters }: OldSpritePaletteMaterialParameters) {
    super(parameters)
    this._paletteMap = new Uniform(paletteMap)
    this.alphaTest = .5
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms): void {
    shader.vertexShader = vert
    shader.fragmentShader = frag

    shader.uniforms.paletteMap = this._paletteMap
    shader.uniforms.uLightLevel = this._lightLevel
  }
}
