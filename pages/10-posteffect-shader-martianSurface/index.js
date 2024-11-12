import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  GridHelper,
  Quaternion,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import vert from "./vert.glsl?raw";
import frag from "./frag.glsl?raw";
import * as THREE from "three";

const width = 1400;
const height = 700;

// scene
const scene = new Scene();

// renderer
const canvas = document.querySelector(".canvas");
const renderer = new WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor("#f5ad47", 1);
renderer.shadowMap.enabled = true;

// camera and orbit controls
const camera = new PerspectiveCamera();
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(6, 3, -10);
controls.target.set(0, 1, 0);

// add grid helper
const gridHelper = new GridHelper(50, 50);
scene.add(gridHelper);

/* texture */
const loader = new THREE.TextureLoader();
const texture = loader.load("/assets/texture/noise.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

texture.minFilter = THREE.NearestFilter;
texture.magFilter = THREE.NearestFilter;

//composer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const rayMarchingPass = new ShaderPass({
  vertexShader: vert,
  fragmentShader: frag,
  uniforms: {
    cameraPos: { value: camera.position.clone() },
    resolution: { value: new Vector2(width, height) },
    cameraQuaternion: { value: camera.quaternion.clone() },
    fov: { value: camera.fov },
    uTime: {
      value: 0,
    },
    uTexture: {
      value: texture,
    },
  },
});
composer.addPass(rayMarchingPass);

// render loop
const onAnimationFrameHandler = (_timeStamp) => {
  // update the time uniform of the shader
  const worldPos = new Vector3();
  rayMarchingPass.uniforms.cameraPos.value.copy(camera.getWorldPosition(worldPos));
  const cameraQuaternion = new Quaternion();
  rayMarchingPass.uniforms.cameraQuaternion.value.copy(camera.getWorldQuaternion(cameraQuaternion));
  rayMarchingPass.uniforms.fov.value = camera.fov;
  rayMarchingPass.uniforms.uTime.value += 0.01;
  rayMarchingPass.uniforms.uTexture.value = texture;
  composer.render();
  window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// resize
const windowResizeHanlder = () => {
  renderer.setSize(width, height);
  composer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  rayMarchingPass.uniforms.resolution.value.set(width, height);
};
windowResizeHanlder();
window.addEventListener("resize", windowResizeHanlder);
