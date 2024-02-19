export default {
  after: '#include <alphamap_fragment>',
  fragment: `
#ifdef USE_ALPHAMAP
  diffuseColor.a = texture2D( alphaMap, vMapUv ).r;
#endif
  `,
}
