import { MeshBasicMaterial, Shader } from 'three'
import { PaletteTexture } from './palette-texture'

const fragmentShaderReplacements = [
  {
    from: '#include <common>',
    to: `
      #include <common>
      uniform sampler2D paletteTexture;
    `,
  },
  {
    from: '#include <color_fragment>',
    to: `
      #include <color_fragment>
      {
        vec4 indexColor = texture2D(map, vUv);
        float index = indexColor.r * 255.0;
        vec2 paletteUV = vec2((index + 0.5) / 256.0, 0.5);
        vec4 paletteColor = texture2D(paletteTexture, paletteUV);

        diffuseColor.rgb = paletteColor.rgb;
      }
    `,
  },
]

export class PaletteMaterial extends MeshBasicMaterial {

  paletteTexture = new PaletteTexture()

  onBeforeCompile(shader: Shader): void {
    fragmentShaderReplacements.forEach((rep) => {
      shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to)
    })

    shader.uniforms.paletteTexture = { value: this.paletteTexture }
  }
}
