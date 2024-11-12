uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {
    vec4 baseColor = texture2D(baseTexture, vUv);
    vec4 bloomColor = vec4(1.0) * texture2D(bloomTexture, vUv);
    gl_FragColor = baseColor + bloomColor;

}
