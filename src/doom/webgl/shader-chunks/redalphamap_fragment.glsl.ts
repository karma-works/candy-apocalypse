export default {
  after: '#include <alphamap_fragment>',
  fragment: `
#ifdef USE_ALPHAMAP
  diffuseColor.a = texture2D( alphaMap, vUv ).r;
#endif
  `,
}
