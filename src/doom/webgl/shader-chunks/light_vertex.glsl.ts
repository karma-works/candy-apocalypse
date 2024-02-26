export default {
  after: '#include <fog_vertex>',
  vertex: `
vLightDepth = -mvPosition.z;
  `,
}
