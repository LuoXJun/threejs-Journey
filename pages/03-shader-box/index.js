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

/* 初始化数据 */
let i = 0;
const size = 32;
const data = new Float32Array(4 * size * size * size);
let inverseResolution = 1.0 / (size - 1.0);

for (let z = 0; z < size; z++) {
  let zOffset = z * size * size;
  for (let y = 0; y < size; y++) {
    let yOffset = y * size;
    for (let x = 0; x < size; x++) {
      const index = x + yOffset + zOffset;
      data[4 * index] = x * inverseResolution;
      data[4 * index + 1] = y * inverseResolution;
      data[4 * index + 2] = z * inverseResolution;
      data[4 * index + 3] = 1;
    }
  }
}

/* 材质 */
const texture = new THREE.Data3DTexture(data, size, size, size);
texture.format = THREE.RGBAFormat;
texture.type = THREE.FloatType;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.unpackAlignment = 4;
texture.needsUpdate = true;

const boxSize = 5;
const geo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const mat = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    map: { value: texture },
    cameraPos: { value: new THREE.Vector3() },
    steps: { value: 200 },
  },
});
const mesh = new THREE.Mesh(geo, mat);
mesh.position.set(2, 2, 2);

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
