#include <common>
#include <uv_pars_vertex>
#include ./seguv_pars_vertex
#include ./light_pars_vertex
#include ./transform

void main() {
	#include <uv_vertex>

	#include ./seguv_vertex

	#include <begin_vertex>
  #include <project_vertex>

	#include ./light_vertex
}
