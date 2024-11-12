import * as THREE from "three";
import vert from "./shaders/vert.glsl?raw";
import frag from "./shaders/frag.glsl?raw";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

var camera, scene, renderer;
var material, controls;

init();

function init() {
  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.z = 4000;

  scene = new THREE.Scene();

  const textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load("../../assets/texture/cloud10.png");
  texture.magFilter = THREE.LinearMipMapLinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  var fog = new THREE.Fog(0x4584b4, -100, 3000);

  material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
    },
    vertexShader: vert,
    fragmentShader: frag,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const instanceCount = 8000;
  const geometry = new THREE.PlaneGeometry(64, 64);
  const instancedMesh = new THREE.InstancedMesh(geometry, material, instanceCount);

  const matrix4 = new THREE.Matrix4();
  const translation = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  for (let i = 0; i < instanceCount; i++) {
    // translation.set(Math.random() * 1000 - 500, -Math.random() * Math.random() * 200 - 15, i);
    // quaternion.setFromEuler(new THREE.Euler(0, 0, Math.random() * Math.PI));
    // scale.set(
    //   Math.random() * Math.random() * 1.5 + 0.5,
    //   Math.random() * Math.random() * 1.5 + 0.5,
    //   1
    // );
    // matrix4.compose(translation, quaternion, scale);

    matrix4.setPosition(Math.random() * 1000 - 500, -Math.random() * Math.random() * 200 - 15, i);
    instancedMesh.setMatrixAt(i, matrix4.clone());
  }
  instancedMesh.instanceMatrix.needsUpdate = true;

  scene.add(instancedMesh);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  controls = new OrbitControls(camera, renderer.domElement);

  const axes = new THREE.AxesHelper(1000);
  scene.add(axes);

  console.log(scene);

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize(event) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  renderer.render(scene, camera);
}
animate();
