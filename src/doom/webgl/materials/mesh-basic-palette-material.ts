import { MeshBasicMaterial, WebGLProgramParametersWithUniforms } from 'three'
import { PaletteTexture } from '../textures/palette-texture'
import paletteMap from '../shader-chunks/palettemap_fragment.gsls'
import paletteMapPars from '../shader-chunks/palettemap_pars_fragment.glsl'
import { patchShader } from '../shader-chunks/patch-utils'
import redAlphamap from '../shader-chunks/redalphamap_fragment.glsl'

export class MeshBasicPaletteMaterial extends MeshBasicMaterial {

  paletteTexture = new PaletteTexture()

  transparent = true
  alphaTest = 0.5

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms): void {
    patchShader(shader, paletteMapPars)
    patchShader(shader, paletteMap)
    patchShader(shader, redAlphamap)

    shader.uniforms.paletteMap = { value: this.paletteTexture }
  }
}
