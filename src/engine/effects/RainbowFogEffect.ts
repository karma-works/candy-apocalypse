import {
  Camera,
  Color3,
  PostProcess,
  Scene,
  Effect,
  Matrix,
  Vector3,
} from "@babylonjs/core";

export class RainbowFogEffect {
  private postProcess: PostProcess;
  private time: number = 0;
  private fogStart: number;
  private fogEnd: number;
  private colorSpeed: number;
  private rainbowIntensity: number;

  constructor(
    camera: Camera,
    options: {
      fogStart?: number;
      fogEnd?: number;
      colorSpeed?: number;
      rainbowIntensity?: number;
    } = {},
  ) {
    this.fogStart = options.fogStart ?? 5;
    this.fogEnd = options.fogEnd ?? 40;
    this.colorSpeed = options.colorSpeed ?? 1;
    this.rainbowIntensity = options.rainbowIntensity ?? 0.8;

    Effect.ShadersStore["RainbowFogFragmentShader"] = `
      precision highp float;

      varying vec2 vUV;

      uniform sampler2D textureSampler;
      uniform float fogStart;
      uniform float fogEnd;
      uniform float time;
      uniform float rainbowIntensity;
      uniform mat4 viewMatrix;
      uniform vec3 cameraPosition;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec4 baseColor = texture2D(textureSampler, vUV);

        float depth = gl_FragCoord.z / gl_FragCoord.w;

        float fogFactor = clamp((fogEnd - depth) / (fogEnd - fogStart), 0.0, 1.0);

        float hue = 0.0;
        hue += vUV.x * 0.3;
        hue += vUV.y * 0.2;
        hue += time * 0.1;
        hue += sin(depth * 0.1 + time) * 0.15;
        hue = fract(hue);

        float saturation = 0.7 + sin(time * 2.0 + vUV.x * 5.0) * 0.2;
        float value = 0.6 + sin(time * 1.5 + vUV.y * 3.0) * 0.2;

        vec3 rainbowColor = hsv2rgb(vec3(hue, saturation, value));

        float shimmer = sin(vUV.x * 50.0 + time * 3.0) * sin(vUV.y * 50.0 + time * 2.0) * 0.1;
        rainbowColor += shimmer;

        vec3 fogColor = mix(vec3(0.1, 0.1, 0.15), rainbowColor, rainbowIntensity);

        vec3 finalColor = mix(fogColor, baseColor.rgb, fogFactor);

        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `;

    this.postProcess = new PostProcess(
      "RainbowFog",
      "RainbowFog",
      [
        "fogStart",
        "fogEnd",
        "time",
        "rainbowIntensity",
        "viewMatrix",
        "cameraPosition",
      ],
      null,
      1.0,
      camera,
    );

    this.postProcess.onApply = (effect) => {
      this.time += 0.016 * this.colorSpeed;
      effect.setFloat("fogStart", this.fogStart);
      effect.setFloat("fogEnd", this.fogEnd);
      effect.setFloat("time", this.time);
      effect.setFloat("rainbowIntensity", this.rainbowIntensity);
      effect.setMatrix("viewMatrix", camera.getViewMatrix());
      effect.setVector3("cameraPosition", camera.position);
    };
  }

  setFogStart(start: number): void {
    this.fogStart = start;
  }

  setFogEnd(end: number): void {
    this.fogEnd = end;
  }

  setColorSpeed(speed: number): void {
    this.colorSpeed = speed;
  }

  setRainbowIntensity(intensity: number): void {
    this.rainbowIntensity = intensity;
  }

  dispose(): void {
    this.postProcess.dispose();
  }
}
