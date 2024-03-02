import { Matrix3, SpriteMaterial, SpriteMaterialParameters, Texture, Uniform, Vector2, WebGLProgramParametersWithUniforms } from 'three'
import { PaletteTexture } from '../textures/palette-texture'
import frag from '../shaders/sprite.frag.glsl'
import vert from '../shaders/sprite.vert.glsl'

export interface RotationMap {
  map?: Texture | null | undefined;
  mapTransform?: Matrix3 | null | undefined;
  alphaMap?: Texture | null | undefined;
  alphaMapTransform?: Matrix3 | null | undefined;
  scale?: Vector2
}

export interface SpritePaletteMaterialParameters extends SpriteMaterialParameters {
  paletteMap: PaletteTexture
  rotationMap?: RotationMap[]
}

export class SpritePaletteMaterial extends SpriteMaterial {
  get paletteMap() {
    return this._paletteMap.value
  }
  set paletteMap(paletteMap: PaletteTexture) {
    this._paletteMap.value = paletteMap
  }
  private _paletteMap

  set rotationMap(map: RotationMap[] | null) {
    if (map === null && this._rotationMap.value !== null ||
      map !== null && this._rotationMap.value === null
    ) {
      this.needsUpdate = true
    }
    this._rotationMap.value = map
  }
  private _rotationMap = new Uniform<RotationMap[] | null>(null)

  // Light level from 0 to 255
  get lightLevel() {
    return this._lightLevel.value
  }
  set lightLevel(lightLevel: number) {
    this._lightLevel.value = lightLevel
  }
  private _lightLevel = new Uniform(255)

  transparent = true
  alphaTest = 0.5

  constructor({ paletteMap, ...parameters }: SpritePaletteMaterialParameters) {
    super(parameters)
    this._paletteMap = new Uniform(paletteMap)
  }

  onBeforeCompile(shader: WebGLProgramParametersWithUniforms): void {
    shader.vertexShader = vert
    shader.fragmentShader = frag

    shader.uniforms.paletteMap = this._paletteMap
    shader.uniforms.uLightLevel = this._lightLevel
    shader.uniforms.uRotationMap = this._rotationMap

    const rotMap = this._rotationMap.value
    if (rotMap) {
      shader.defines = { 'USE_ROTATIONMAP': '' }
      shader.map = true
      shader.mapUv = 'uv'
      shader.alphaMap = true
      shader.alphaMapUv = 'uv'
    }
  }
}
