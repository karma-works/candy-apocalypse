uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>

uniform sampler2D paletteMap;

#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>

varying float vLightDepth;
uniform float uLightLevel;

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );

	vec3 outgoingLight = vec3( 0.0 );

#ifdef USE_MAP

	vec4 indexColor = texture2D( map, vMapUv );
	vec2 paletteUv = vec2((indexColor.r * 255.0 + 0.5) / 256.0, 0.5);

	vec4 sampledDiffuseColor = texture2D( paletteMap, paletteUv );

	diffuseColor *= sampledDiffuseColor;

#endif

#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).r;

#endif

	#include <alphatest_fragment>

	float lightLevel = (15. - (uLightLevel / 16.)) * 4.;
	float scale = 80. / ((vLightDepth / 16.) + 1.);
	float lightFactor = clamp(lightLevel - scale, 0., 32.);
	diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.), lightFactor / 32.);

	outgoingLight = diffuseColor.rgb;

	#include <opaque_fragment>
	#include <colorspace_fragment>

}
