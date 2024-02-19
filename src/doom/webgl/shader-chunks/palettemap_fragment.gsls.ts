export default {
  after: '#include <map_fragment>',
  fragment: `
vec4 indexColor = texture2D(map, vUv);
float index = indexColor.r * 255.0;
vec2 paletteUV = vec2((index + 0.5) / 256.0, 0.5);
vec4 paletteColor = texture2D(paletteMap, paletteUV);

diffuseColor.rgb = paletteColor.rgb;
  `,
}
