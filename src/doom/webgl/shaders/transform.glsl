vec2 rotateY( vec2 value, float angle ) {
  float s = sin( angle );
  float c = cos( angle );
  return vec2( value.x * c - value.y * s, value.x * s + value.y * c );
}

float extractYRotation( mat4 modelViewMatrix ) {
  mat3 rotationMatrix = mat3( modelViewMatrix );
  float angle = atan( rotationMatrix[0][2], rotationMatrix[2][2] );
  return angle;
}

vec3 extractScale( mat4 modelMatrix ) {
  mat3 rotationMatrix = mat3( modelMatrix );

  return vec3(
    length( rotationMatrix[0] ),
    length( rotationMatrix[1] ),
    length( rotationMatrix[2] )
  );
}
