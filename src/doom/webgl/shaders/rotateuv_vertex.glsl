float rotation = extractYRotation( modelViewMatrix );
// + 22.5 deg
rotation += PI / 8.;

int rotationIdx = int( mod( rotation / (PI / 4.), uRotations ) );

vMapUv.x /= uRotations;
vMapUv.x += float( rotationIdx ) / uRotations;
