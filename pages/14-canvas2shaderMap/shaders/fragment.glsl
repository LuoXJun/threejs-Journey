precision highp float;
varying vec2 vUv;

uniform sampler2D map;

void main() {
    vec4 lineColor = vec4(1., 1., 0., 1.);

    // 行政区域范围
    vec4 line = texture2D(map, vUv);

    gl_FragColor = lineColor * line;

}