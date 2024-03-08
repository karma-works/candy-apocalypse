#include <common>
#include <uv_pars_vertex>
#include ./light_pars_vertex
#include ./camera
#include ./transform

uniform float uFrame;
uniform float uFrames;
uniform float uRotations;

void main() {
	#include <uv_vertex>

	#include ./rotateuv_vertex
	#include ./frameuv_vertex

	#include <begin_vertex>

	#include ./billboard_vertex
  
  #include <project_vertex>

	#include ./light_vertex
}
