uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>

uniform sampler2D paletteMap;

#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>

#ifdef USE_ROTATIONMAP

varying float vRotationIdx;

struct RotationMap { 
	sampler2D map;
	mat3 mapTransform;
	sampler2D alphaMap;
	mat3 alphaMapTransform;
	vec2 scale;
};
uniform RotationMap uRotationMap[8];

#endif

varying float vLightDepth;
uniform float uLightLevel;

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );

	vec3 outgoingLight = vec3( 0.0 );

#ifdef USE_MAP

#ifdef USE_ROTATIONMAP
	vec4 indexColor = texture2D( uRotationMap[int(vRotationIdx)].map, vMapUv );
#else
	vec4 indexColor = texture2D( map, vMapUv );
#endif
	vec2 paletteUv = vec2((indexColor.r * 255.0 + 0.5) / 256.0, 0.5);

	vec4 sampledDiffuseColor = texture2D( paletteMap, paletteUv );

	diffuseColor *= sampledDiffuseColor;

#endif

#ifdef USE_ALPHAMAP

#ifdef USE_ROTATIONMAP
	diffuseColor.a *= texture2D( uRotationMap[int(vRotationIdx)].alphaMap, vAlphaMapUv ).r;
#else
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).r;
#endif

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
