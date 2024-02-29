import { SpriteMaterial, SpriteMaterialParameters, Uniform, WebGLProgramParametersWithUniforms } from 'three'
import { PaletteTexture } from '../textures/palette-texture'
import paletteMap from '../shader-chunks/palettemap_fragment.gsls'
import paletteMapPars from '../shader-chunks/palettemap_pars_fragment.glsl'
import { patchShader } from '../shader-chunks/patch-utils'
import redAlphamap from '../shader-chunks/redalphamap_fragment.glsl'

export interface SpritePaletteMaterialParameters extends SpriteMaterialParameters {
  paletteMap: PaletteTexture
}

export class SpritePaletteMaterial extends SpriteMaterial {
  get paletteMap() {
    return this._paletteMap.value
  }
  set paletteMap(paletteMap: PaletteTexture) {
    this._paletteMap.value = paletteMap
  }
  _paletteMap: Uniform<PaletteTexture>

  transparent = true
  alphaTest = 0.5

  constructor({ paletteMap, ...parameters }: SpritePaletteMaterialParameters) {
    super(parameters)
    this._paletteMap = new Uniform(paletteMap)
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms): void {
    patchShader(shader, paletteMapPars)
    patchShader(shader, paletteMap)
    patchShader(shader, redAlphamap)

    shader.uniforms.paletteMap = this._paletteMap
  }
}
