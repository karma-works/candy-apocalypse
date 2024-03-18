vec3 modelScale = extractScale( modelMatrix );

vMapUv *= modelScale.xy;
vMapUv += uTexOffset;
vMapUv /= uTexSize;

vMapUv.y = 1. - vMapUv.y;
