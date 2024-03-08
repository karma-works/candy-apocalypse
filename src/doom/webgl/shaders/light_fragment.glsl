float lightLevel = (15. - (uLightLevel / 16.)) * 4.;
float scale = 80. / ((vLightDepth / 16.) + 1.);
float lightFactor = clamp(lightLevel - scale, 0., 32.);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.), lightFactor / 32.);
