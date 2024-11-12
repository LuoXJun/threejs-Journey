import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertex from "./vertex.glsl?raw";
import fragment from "./fragment.glsl?raw";

const canvas = document.querySelector(".canvas");

const scene = new THREE.Scene();

const sizes = [1200, 800];
const camera = new THREE.PerspectiveCamera(45, sizes[0] / sizes[1], 0.1, 10000);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.position.set(10, 5, 10);

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes[0], sizes[1]);
renderer.setClearColor("#000");

const boxSize = 5;
const geo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const mat = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    cameraPos: {
      value: camera.position.clone(),
    },
    boxSize: {
      value: boxSize,
    },
  },
});
const mesh = new THREE.Mesh(geo, mat);

scene.add(mesh);

const axes = new THREE.AxesHelper(10);
scene.add(axes);

const controls = new OrbitControls(camera, canvas);

const defaultVector3 = new THREE.Vector3();
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  camera.getWorldPosition(defaultVector3);
  mat.uniforms.cameraPos.value.copy(defaultVector3);

  renderer.render(scene, camera);
};

animate();
