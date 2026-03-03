export default {
  replace: '#include <map_fragment>',
  fragment: `
#ifdef USE_MAP
  vec4 indexColor = texture2D( map, vMapUv );
  
  #ifdef IS_SVG
    diffuseColor *= indexColor;
  #else
    vec2 paletteUv = vec2((indexColor.r * 255.0 + 0.5) / 256.0, 0.5);
    vec4 sampledDiffuseColor = texture2D( paletteMap, paletteUv );
    diffuseColor *= sampledDiffuseColor;
  #endif
#endif
  `,
}
