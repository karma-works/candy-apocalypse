float lightLevel = (15. - (uLightLevel / 16.)) * 4.;
float scale = 80. / ((vLightDepth / 16.) + 1.);
float lightFactor = clamp(lightLevel - scale, 0., 32.);
vec3 fogColor = vec3(0.1, 0.05, 0.2);
gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, lightFactor / 32.);
