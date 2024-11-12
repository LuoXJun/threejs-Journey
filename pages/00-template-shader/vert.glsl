uniform vec3 cameraPos;

varying vec3 vOrigin;
varying vec3 vDirection;
varying vec2 vUv;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPos, 1.0)).xyz;
    vDirection = position - vOrigin;
    vUv = uv;

    gl_Position = projectionMatrix * mvPosition;
}