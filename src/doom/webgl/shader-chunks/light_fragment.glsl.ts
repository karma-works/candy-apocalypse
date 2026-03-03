export default {
  after: "#include <fog_fragment>",
  fragment: `
// Simple global illumination - no distance-based darkening
float lightLevel = uLightLevel / 255.0;
gl_FragColor.rgb *= lightLevel;
  `,
};
