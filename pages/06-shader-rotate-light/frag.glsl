precision highp float;
varying vec3 vOrigin;
varying vec3 vDirection;
varying vec2 vUv;

uniform float uTime;
uniform float boxSize;

#define MAX_STEPS 120
#define MAX_DIST 100.0
#define SURFACE_DIST 0.001

// I recommend setting up your codebase with glsify so you can import these functions
// This function comes from glsl-rotate https://github.com/dmnsgn/glsl-rotate/blob/main/rotation-3d.glsl
mat4 rotation3d(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotation3d(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}

// Tweaked Cosine color palette function from Inigo Quilez
vec4 getColor(float amount) {
    vec3 color = vec3(0.3, 0.5, 0.9) + vec3(0.9, 0.4, 0.2) * cos(6.2831 * (vec3(0.30, 0.20, 0.20) + amount * vec3(1.0)));
    return vec4(color * amount, 1.);
}

float sdSphere(vec3 p, float radius) {
    return length(p) - radius;
}

float sdSine(vec3 p) {
    return 1.0 - (sin(p.x) + sin(p.y) + sin(p.z)) / 3.0;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float scene(vec3 p) {
    vec3 p1 = rotate(p, vec3(1.0), uTime * 0.4);
    float sphere = sdSphere(p1, boxSize / 2.);

    float scale = 8.0 + 6.0 * sin(uTime * 0.5);
    float sine = (0.8 - sdSine(p1 * scale)) / (scale * 2.0);

    float distance = max(sphere, sine);

    return distance;
}

float raymarch(vec3 ro, vec3 rd) {
    float dO = 0.0;

    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = scene(p);

        dO += dS;

        if(dO > MAX_DIST || dS < SURFACE_DIST) {
            break;
        }
    }
    return dO;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(.01, 0);

    vec3 n = scene(p) - vec3(scene(p - e.xyy), scene(p - e.yxy), scene(p - e.yyx));

    return normalize(n);
}

float softShadows(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float resultingShadowColor = 1.0;
    float t = mint;
    for(int i = 0; i < 50 && t < maxt; i++) {
        float h = scene(ro + rd * t);
        if(h < 0.001)
            return 0.0;
        resultingShadowColor = min(resultingShadowColor, k * h / t);
        t += h;
    }
    return resultingShadowColor;
}

void main() {
    vec2 uv = vUv;
    uv -= 0.5;

  // Light Position
    vec3 lightPosition = vec3(-10.0 * cos(uTime), 10.0 * sin(uTime), 10.0 * abs(sin(-uTime * 0.5)));

    vec3 rd = normalize(vDirection);

    float d = raymarch(vOrigin, rd);
    vec3 p = vOrigin + rd * d;

    vec4 color = vec4(1.);

    if(d < MAX_DIST) {
        vec3 normal = getNormal(p);
        vec3 lightDirection = normalize(lightPosition - p);

        float diffuse = max(dot(normal, lightDirection), 0.0);
        float shadows = softShadows(p, lightDirection, 0.1, 5.0, 64.0);
        color *= getColor(diffuse * shadows);
    } else
        discard;

    gl_FragColor = color;
}
