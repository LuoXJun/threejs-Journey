precision highp float;
varying vec3 vOrigin;
varying vec3 vDirection;

uniform float uTime;
uniform vec2 uResolution;
uniform float boxSize;

#define MAX_STEPS 120
#define MAX_DIST 100.0
#define SURFACE_DIST 0.001

void main() {

    gl_FragColor = vec4(1.0);
}
