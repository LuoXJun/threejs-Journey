import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vert from "./vert.glsl?raw";
import frag from "./frag.glsl?raw";

const canvas = document.querySelector(".canvas");

const scene = new THREE.Scene();

const sizes = [1400, 700];
const camera = new THREE.PerspectiveCamera(45, sizes[0] / sizes[1], 0.1, 10000);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.position.set(10, 5, 10);

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes[0], sizes[1]);
renderer.setClearColor("#d5d5d5");

const boxSize = 10;
const geo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const mat = new THREE.ShaderMaterial({
  vertexShader: vert,
  fragmentShader: frag,
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },
    cameraPos: {
      value: new THREE.Vector3(),
    },
    boxSize: {
      value: boxSize,
    },
  },
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

const axes = new THREE.AxesHelper(20);
scene.add(axes);

const controls = new OrbitControls(camera, canvas);

const vec3 = new THREE.Vector3();
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  camera.getWorldPosition(vec3);

  mat.uniforms.uTime.value += 0.01;
  mat.uniforms.cameraPos.value.copy(vec3);

  renderer.render(scene, camera);
};

animate();
