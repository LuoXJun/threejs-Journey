import { WebGLRenderer, PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import * as THREE from "three";
import vert from "./vert.glsl?raw";
import frag from "./frag.glsl?raw";
import noise from "./noise.glsl?raw";

// https://codepen.io/prisoner849/full/poNXPyv

const width = 1200;
const height = 700;
const backColor = "#665566";

// scene
const scene = new Scene();
scene.background = new THREE.Color(backColor);
scene.fog = new THREE.Fog(backColor, 1, 25);

// renderer
const canvas = document.querySelector(".canvas");
const renderer = new WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor("#f5ad47", 1);
renderer.shadowMap.enabled = true;

// camera and orbit controls
const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(6, 3, -10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

//
const gridHelper = new THREE.GridHelper(100, 10, "#f5ad47", "cyan");
scene.add(gridHelper);

/* 全局uniform */
let globalUniforms = {
  time: { value: 0 },
  globalBloom: { value: 0 },
  noise: { value: null },
};

/* rtt===================================== start */
let renderTarget = new THREE.WebGLRenderTarget(512, 512);
let rtScene = new THREE.Scene();
let rtCamera = new THREE.Camera();
let rtGeo = new THREE.PlaneGeometry(2, 2);
let rtMat = new THREE.MeshBasicMaterial({
  onBeforeCompile: (shader) => {
    shader.uniforms.time = globalUniforms.time;
    shader.fragmentShader = `
    	uniform float time;
      ${noise}
      ${shader.fragmentShader}
    `.replace(
      `vec4 diffuseColor = vec4( diffuse, opacity );`,
      `
      	vec3 col = vec3(0);
        float h = clamp(smoothNoise2(vUv * 50.), 0., 1.);
        col = vec3(h);
        vec4 diffuseColor = vec4( col, opacity );
      `
    );
  },
});
rtMat.defines = { USE_UV: "" };
let rtPlane = new THREE.Mesh(rtGeo, rtMat);
rtScene.add(rtPlane);
globalUniforms.noise.value = renderTarget.texture;
/* rtt===================================== end */

// set postprocessing =============================================================
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1, 0.5, 0);
//bloomPass.threshold = 0;
//bloomPass.strength = 1;
//bloomPass.radius = 0.5;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const finalPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader: vert,
    fragmentShader: frag,
    defines: {},
  }),
  "baseTexture"
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(finalPass);

const filmPass = new FilmPass(0.35, 0.025, 648, false);
finalComposer.addPass(filmPass);

// ----------------------------------------------------------------------------

/* 发光运动小球 luces */
let luces = [];
let lucesInit = [];
let instCount = 100;
let lg = new THREE.InstancedBufferGeometry().copy(new THREE.SphereGeometry(1, 36, 18));
lg.instanceCount = instCount;
let instData = [];
for (let i = 0; i < instCount; i++) {
  let x = THREE.MathUtils.randFloatSpread(49);
  let z = THREE.MathUtils.randFloatSpread(49);
  let scale = THREE.MathUtils.randFloat(0.0625, 0.125);
  let ldist = THREE.MathUtils.randFloat(1, 3);
  instData.push(x, z, scale);
  lucesInit.push(new THREE.Vector4(x, z, ldist, THREE.MathUtils.randFloat(1, 2)));
  luces.push(new THREE.Vector4(x, z, scale, ldist));
}
lg.setAttribute("instData", new THREE.InstancedBufferAttribute(new Float32Array(instData), 3));
let lm = new THREE.MeshBasicMaterial({
  color: 0xff2222,
  onBeforeCompile: (shader) => {
    shader.uniforms.noiseTex = globalUniforms.noise;
    shader.vertexShader = `
      uniform sampler2D noiseTex;
      attribute vec4 instData;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
      transformed = position * instData.z;
      
      transformed.x += instData.x;
      transformed.z += instData.y;
      vec2 nUv = (vec2(instData.x, -instData.y) - vec2(-25.)) / 50.;
      float h = texture2D(noiseTex, nUv).g;
      h = (h - 0.5) * 4.;
      transformed.y += h;
      `
    );
    //console.log(shader.fragmentShader);
  },
});
let lo = new THREE.Mesh(lg, lm);
scene.add(lo);

/* plane---地形 */
let pg = new THREE.PlaneGeometry(50, 50, 500, 500);
pg.rotateX(-Math.PI * 0.5);
let planeUniforms = {
  luces: { value: luces },
};
let pm = new THREE.MeshLambertMaterial({
  color: 0x241224,
  wireframe: false,
  onBeforeCompile: (shader) => {
    shader.uniforms.luces = planeUniforms.luces;
    shader.uniforms.globalBloom = globalUniforms.globalBloom;
    shader.uniforms.noiseTex = globalUniforms.noise;
    shader.vertexShader = `
      uniform float time;
      uniform sampler2D noiseTex;
      varying vec3 vPos;
      varying float intensity;

      //// https://discourse.threejs.org/t/calculating-vertex-normals-after-displacement-in-the-vertex-shader/16989/8 ///

      // the function which defines the displacement
      float displace(vec2 vUv) {
        return (texture2D(noiseTex, vUv).g - 0.5) * 4.;
      }

      vec3 getNormal(vec2 vUv){
        vec3 displacedPosition = position + normal * displace(vUv);

        float texelSize = 1.0 / 512.0; // temporarily hardcoding texture resolution
        float offset = 0.1;

        vec3 neighbour1 = position + vec3(1., 0., 0.) * offset;
        vec3 neighbour2 = position + vec3(0., 0., 1.) * offset;
        vec2 neighbour1uv = vUv + vec2(-texelSize, 0);
        vec2 neighbour2uv = vUv  + vec2(0, -texelSize);
        vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1uv);
        vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2uv);

        // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
        vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
        vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

        // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
        vec3 displacedNormal = normalize(cross(displacedBitangent, displacedTangent));
        return displacedNormal;
      }
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>

        float h = texture2D(noiseTex, uv).g;
        intensity = h;
        h = (h - 0.5) * 4.;
        transformed.y = h;
        vPos = transformed;
        transformedNormal = normalMatrix * getNormal(uv);
      `
    );
    shader.fragmentShader = `
      uniform vec4 luces[${instCount}];
      uniform sampler2D noiseTex;
      uniform float globalBloom;
      varying vec3 vPos;
      varying float intensity;

      ${shader.fragmentShader}
    `
      .replace(
        `#include <fog_fragment>`,
        `
        vec3 col = vec3(1, 0, 0)*0.75;
        float intensity = 0.;
        for(int i = 0;i < ${instCount}; i++){
          vec4 lux = luces[i];
          vec2 luxUv = (vec2(lux.x, -lux.y) - vec2(-25.)) / 50.;
          float h = texture2D(noiseTex, luxUv).g;
          h = (h - 0.5) * 4.;
          vec3 lightPos = vec3(lux.x, h, lux.y);
          float currIntensity = smoothstep(lux.z + lux.w, lux.z, distance(vPos, lightPos));
          intensity += pow(currIntensity, 16.);
        }
        intensity = clamp(intensity, 0., 1.);
        col = mix(col * 0.5, col, intensity);
        col = mix(gl_FragColor.rgb, col, intensity);
        col += vec3(1) * intensity * 0.01;
        gl_FragColor = vec4( col, opacity );
        #include <fog_fragment>
      `
      )
      .replace(
        `#include <dithering_fragment>`,
        `#include <dithering_fragment>
        if (globalBloom > 0.5) {
          gl_FragColor = vec4(0);
        }
      `
      );
    //console.log(shader.fragmentShader);
  },
});
let plane = new THREE.Mesh(pg, pm);
scene.add(plane);

/* portal  三角标牌 */
let tg = new THREE.PlaneGeometry();
tg.translate(0, 0.5, 0);
tg.scale(5, 5, 5);
let tm = new THREE.MeshBasicMaterial({
  color: 0xff4400,
  fog: false,
  transparent: true,
  onBeforeCompile: (shader) => {
    shader.uniforms.time = globalUniforms.time;
    shader.uniforms.globalBloom = globalUniforms.globalBloom;
    shader.fragmentShader = `
      #define S(a, b, t) smoothstep(a, b, t)
      uniform float time;
      uniform float globalBloom;

      ${noise}

      float getTri(vec2 uv, float shift){
        uv = uv * 2.-1.;
        float a = atan(uv.x + shift,uv.y) + 3.1415926;
        float r = 3.1415926 * 2./3.;
        return cos(floor(.5+a/r)*r-a)*length(uv);
      }

      float doubleTri(vec2 uv, float still, float width){
        vec2 baseUv = uv;
        vec2 e2 = fwidth(baseUv * 20.);
        float e = min(e2.x, e2.y) * width;
        float baseTri = getTri(baseUv, cos(baseUv.y * 31. + time) * sin(baseUv.y * 27. + time * 4.) * 0.025 * still);
        float td = abs(fract(baseTri * 20.) - 0.5);
        float tri = S(e, 0., td) - S(0., e, td);
        tri *= step(0.4, baseTri) -  step(0.5, baseTri);
        return tri;
      }

      ${shader.fragmentShader}
    `
      .replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `
        float tri = doubleTri(vUv, 0.0, 16.);
        float triWave = doubleTri(vUv, 1.0, 8.);
        float fullTri = max(tri, triWave);

        if (fullTri < 0.5) discard;

        vec3 col = mix(diffuse, vec3(0.75), fullTri);

        float blinking = smoothNoise(vec2(time, time * 5.));
        blinking = blinking * 0.9 + 0.1;

        vec4 diffuseColor = vec4(col * blinking, fullTri);
      `
      )
      .replace(
        `#include <dithering_fragment>`,
        `#include <dithering_fragment>
        if (globalBloom > 0.5) {
          gl_FragColor = vec4(gl_FragColor.rgb * 0.375, fullTri);
        }
      `
      );
    //console.log(shader.fragmentShader);
  },
});
tm.defines = { USE_UV: "" };
tm.extensions = { derivatives: true };
let to = new THREE.Mesh(tg, tm);
to.position.set(0, 1.25, -12);
scene.add(to);

/* 下雨 */
let gPos = [];
let gEnds = [];
let gCount = 20000;
for (let i = 0; i < gCount; i++) {
  let x = THREE.MathUtils.randFloatSpread(35);
  let y = THREE.MathUtils.randFloat(-5, 10);
  let z = THREE.MathUtils.randFloatSpread(35);
  let len = THREE.MathUtils.randFloat(0.25, 0.5);
  gPos.push(x, y, z, x, y, z);
  gEnds.push(0, len, 1, len);
}
let gg = new THREE.BufferGeometry();
gg.setAttribute("position", new THREE.Float32BufferAttribute(gPos, 3));
gg.setAttribute("gEnds", new THREE.Float32BufferAttribute(gEnds, 2));
let gm = new THREE.LineBasicMaterial({
  color: 0x884488,
  transparent: true,
  onBeforeCompile: (shader) => {
    shader.uniforms.time = globalUniforms.time;
    shader.uniforms.noiseTex = globalUniforms.noise;
    shader.uniforms.globalBloom = globalUniforms.globalBloom;
    shader.vertexShader = `
      uniform float time;
      uniform sampler2D noiseTex;
      attribute vec2 gEnds;
      varying float vGEnds;
      varying float vH;

      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        
      vec3 pos = position;
      
      vec2 nUv = (vec2(pos.x, -pos.z) - vec2(-25.)) / 50.;
      float h = texture2D(noiseTex, nUv).g;
      h = (h - 0.5) * 4.;
      
      pos.y = -mod(10. - (pos.y - time * 5.), 15.) + 10.;
      h = pos.y - h;
      pos.y += gEnds.x * gEnds.y;
      transformed = pos;
      vGEnds = gEnds.x;
      vH = smoothstep(3., 0., h);
      `
    );
    shader.fragmentShader = `
      uniform float time;
      uniform float globalBloom;
      varying float vGEnds;
      varying float vH;
      ${noise}
      ${shader.fragmentShader}
    `.replace(
      `vec4 diffuseColor = vec4( diffuse, opacity );`,
      `
      float op = 1. - vGEnds;
      op = pow(op, 3.);
      float h = (pow(vH, 3.) * 0.5 + 0.5);
      vec3 col = diffuse * h; // lighter close to the surface
      col *= 1. + smoothstep(0.99, 1., h); // sparkle at the surface
      if (globalBloom > 0.5) {
        //col *= 0.5;
      }
      vec4 diffuseColor = vec4( col, op );
      
      `
    );
    //console.log(shader.fragmentShader);
  },
});
let go = new THREE.LineSegments(gg, gm);
scene.add(go);

//
function updateScene(t) {
  for (let i = 0; i < instCount; i++) {
    let li = lucesInit[i];
    let z = ((li.y + t + 25) % 50) - 25;
    luces[i].y = z;
    luces[i].w =
      (Math.sin(t * li.w * ((i % 3) + 1)) * Math.cos(t * li.w * ((i % 5) + 1)) * 0.25 + 0.25) *
      li.z +
      li.z * 0.75;
    lg.attributes.instData.setY(i, z);
  }
  lg.attributes.instData.needsUpdate = true;
  globalUniforms.time.value = t;
}
// render loop
let clock = new THREE.Clock();
const onAnimationFrameHandler = () => {
  let t = clock.getElapsedTime();

  controls.update();

  renderer.setRenderTarget(renderTarget);
  renderer.render(rtScene, rtCamera);
  renderer.setRenderTarget(null);

  updateScene(t);

  globalUniforms.globalBloom.value = 1;
  scene.fog.color.setStyle("#000");
  scene.fog.near = 15;
  scene.background.setStyle("#000");

  bloomComposer.render();

  globalUniforms.globalBloom.value = 0;
  scene.fog.color.setStyle(backColor);
  scene.fog.near = 1;
  scene.background.set(backColor);

  finalComposer.render();

  //renderer.render(scene, camera);
  window.requestAnimationFrame(onAnimationFrameHandler);
};
onAnimationFrameHandler();

// resize
const windowResizeHanlder = () => {
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  bloomPass.resolution.set(innerWidth, innerHeight);
  bloomComposer.setSize(innerWidth, innerHeight);
  finalComposer.setSize(innerWidth, innerHeight);
};
windowResizeHanlder();
window.addEventListener("resize", windowResizeHanlder);
