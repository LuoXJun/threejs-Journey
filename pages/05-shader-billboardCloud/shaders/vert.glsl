varying vec2 vUv;

void main() {

    vUv = uv;
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vec4 transformed = instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * transformed;

}