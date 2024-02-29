import { MeshBasicMaterial, MeshBasicMaterialParameters, Uniform, WebGLProgramParametersWithUniforms } from 'three'
import { PaletteTexture } from '../textures/palette-texture'
import lightFragment from '../shader-chunks/light_fragment.glsl'
import lightParsFragment from '../shader-chunks/light_pars_fragment.glsl'
import lightParsVertex from '../shader-chunks/light_pars_vertex.glsl'
import lightVertex from '../shader-chunks/light_vertex.glsl'
import paletteMap from '../shader-chunks/palettemap_fragment.gsls'
import paletteMapPars from '../shader-chunks/palettemap_pars_fragment.glsl'
import { patchShader } from '../shader-chunks/patch-utils'
import redAlphamap from '../shader-chunks/redalphamap_fragment.glsl'

export interface MeshBasicPaletteMaterialParameters extends MeshBasicMaterialParameters {
  lightLevel?: number | undefined
  paletteMap: PaletteTexture
}

export class MeshBasicPaletteMaterial extends MeshBasicMaterial {

  get paletteMap() {
    return this._paletteMap.value
  }
  set paletteMap(paletteMap: PaletteTexture) {
    this._paletteMap.value = paletteMap
  }
  _paletteMap: Uniform<PaletteTexture>

  transparent = true
  alphaTest = 0.5

  // Light level from 0 to 255
  get lightLevel() {
    return this._lightLevel.value
  }
  set lightLevel(lightLevel: number) {
    this._lightLevel.value = lightLevel
  }
  _lightLevel = { value: 255 }

  constructor({ paletteMap, ...parameters }: MeshBasicPaletteMaterialParameters) {
    super(parameters)
    this._paletteMap = new Uniform(paletteMap)
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms): void {
    patchShader(shader, paletteMapPars)
    patchShader(shader, paletteMap)
    patchShader(shader, redAlphamap)
    patchShader(shader, lightParsVertex)
    patchShader(shader, lightVertex)
    patchShader(shader, lightParsFragment)
    patchShader(shader, lightFragment)

    shader.uniforms.paletteMap = this._paletteMap
    shader.uniforms.uLightLevel = this._lightLevel
  }
}
