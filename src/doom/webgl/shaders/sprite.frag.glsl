uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphatest_pars_fragment>
#include ./light_pars_fragment

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );

	#include ./map_fragment
	#include <alphatest_fragment>

	vec3 outgoingLight = diffuseColor.rgb;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>

	#include ./light_fragment
}
