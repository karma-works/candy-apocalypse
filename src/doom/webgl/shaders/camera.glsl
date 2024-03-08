float getCameraYaw() {
  vec3 cameraRight = vec3( modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0] );
  vec3 cameraUp = vec3( modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1] );

  return atan( -cameraRight.z, cameraRight.x );
}
