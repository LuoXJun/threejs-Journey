precision highp float;
varying vec3 vOrigin;
varying vec3 vDirection;

uniform float boxSize;

const float MAX_DISTANCE = 10.;
const float MIN_DISTANCE = 0.0001;
const float MAX_STEP = 64.;

float sphereSDF(vec3 p) {
    return length(p) - boxSize / 2.;
}

void main() {
    vec4 l_color = vec4(0.);

    float dist = 0.;
    vec3 direction = normalize(vDirection);
    for(float i = 0.; i < MAX_STEP; i++) {
        vec3 eye = vOrigin + direction * dist;
        float depth = sphereSDF(eye);

        if(dist > MAX_DISTANCE && depth < MIN_DISTANCE) {
            l_color = vec4(1.);
            break;
        }
        dist += depth;
    }

    gl_FragColor = l_color;

}