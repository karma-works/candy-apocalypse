export default {
  after: '#include <fog_pars_fragment>',
  fragment: `
varying float vLightDepth;
uniform float uLightLevel;
  `,
}
