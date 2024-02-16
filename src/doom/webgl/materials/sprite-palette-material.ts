import { Shader, SpriteMaterial } from 'three'
import { PaletteTexture } from '../textures/palette-texture'

const fragmentShaderReplacements = [
  {
    from: '#include <common>',
    to: `
      #include <common>
      uniform sampler2D paletteTexture;
    `,
  },
  {
    from: '#include <map_fragment>',
    to: `
      #include <map_fragment>
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

export class SpritePaletteMaterial extends SpriteMaterial {
  paletteTexture = new PaletteTexture()

  transparent = true
  alphaTest = 0.5

  onBeforeCompile(shader: Shader): void {
    fragmentShaderReplacements.forEach((rep) => {
      shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to)
    })

    shader.uniforms.paletteTexture = { value: this.paletteTexture }
  }
}
