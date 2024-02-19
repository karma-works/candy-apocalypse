import { MeshBasicMaterial, WebGLProgramParametersWithUniforms } from 'three'
import { PaletteTexture } from '../textures/palette-texture'
import paletteMap from '../shader-chunks/palettemap_fragment.gsls'
import paletteMapPars from '../shader-chunks/palettemap_pars_fragment.glsl'
import redAlphamap from '../shader-chunks/redalphamap_fragment.glsl'


export class MeshBasicPaletteMaterial extends MeshBasicMaterial {

  paletteTexture = new PaletteTexture()

  transparent = true
  alphaTest = 0.5

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms): void {
    [ paletteMapPars, paletteMap, redAlphamap ].forEach(rep => {
      shader.fragmentShader = shader.fragmentShader.replace(
        rep.after,
        `${rep.after} ${rep.fragment}`,
      )
    })

    shader.uniforms.paletteMap = { value: this.paletteTexture }
  }
}
