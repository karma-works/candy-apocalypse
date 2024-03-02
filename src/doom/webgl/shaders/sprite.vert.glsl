uniform float rotation;
uniform vec2 center;

#include <common>
#include <uv_pars_vertex>

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

void main() {

	#include <uv_vertex>

	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>

	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );

	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

#ifdef USE_ROTATIONMAP

	float angle = atan(transformedNormal.z, transformedNormal.x);
  // + 22.5 deg
  angle += PI / 8.;
	// + 90 deg
	angle -= PI / 2.;

	vRotationIdx = mod(angle / (PI / 4.), 8.);

	scale *= uRotationMap[int(vRotationIdx)].scale / 64.;

#ifdef USE_MAP

	vMapUv = ( uRotationMap[int(vRotationIdx)].mapTransform * vec3( MAP_UV, 1 ) ).xy;

#endif
#ifdef USE_ALPHAMAP

	vAlphaMapUv = ( uRotationMap[int(vRotationIdx)].alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;

#endif

#endif

	#ifndef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) scale *= - mvPosition.z;

	#endif

	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;

	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;

	mvPosition.xy += rotatedPosition;

	gl_Position = projectionMatrix * mvPosition;

	vLightDepth = -mvPosition.z;
}
