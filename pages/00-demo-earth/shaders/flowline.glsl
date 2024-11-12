#ifdef USE_FOG
uniform vec3 fogColor;
varying float fogDepth;
	#ifdef FOG_EXP2
uniform float fogDensity;
	#else
uniform float fogNear;
uniform float fogFar;
	#endif
#endif
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
uniform float logDepthBufFC;
varying float vFragDepth;
varying float vIsPerspective;
#endif

uniform sampler2D map;
uniform sampler2D alphaMap;
uniform float useMap;
uniform float useAlphaMap;
uniform float useDash;
uniform float dashArray;
uniform float dashOffset;
uniform float dashRatio;
uniform float visibility;
uniform float alphaTest;
uniform vec2 repeat;

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;

/* 自增uniforms */
uniform sampler2D lineMap;
uniform float utime;
uniform float flowSpeed;

void main() {

#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
    gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2(vFragDepth) * logDepthBufFC * 0.5;
#endif
    vec2 uv = vUV;
    //通过uv沿着x方向的变化实现贴图沿着道路方向流动
    uv.x = 1. - fract(uv.x + utime * flowSpeed);
    float flowAlpha = (1. - abs(uv.y - 0.5) / 0.5) * texture2D(lineMap, uv).r;

    vec4 c = vColor;
    if(useMap == 1.)
        c *= texture2D(map, vUV * repeat);
    if(useAlphaMap == 1.)
        c.a *= texture2D(alphaMap, vUV * repeat).a;
    if(c.a < alphaTest)
        discard;
    if(useDash == 1.) {
        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));
    }
    gl_FragColor = c;
    gl_FragColor.a *= step(vCounters, visibility) * flowAlpha;

#ifdef USE_FOG
	#ifdef FOG_EXP2
    float fogFactor = 1.0 - exp(-fogDensity * fogDensity * fogDepth * fogDepth);
	#else
    float fogFactor = smoothstep(fogNear, fogFar, fogDepth);
	#endif
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif
}