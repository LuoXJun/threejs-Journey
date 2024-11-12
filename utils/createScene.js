import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * @description 搭建基础场景
 * */
export const createScene = () => {
  const canvas = document.querySelector(".canvas");

  const scene = new THREE.Scene();

  const sizes = [1400, 700];
  const camera = new THREE.PerspectiveCamera(45, sizes[0] / sizes[1], 0.1, 10000);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.position.set(0, 7, -7);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(sizes[0], sizes[1]);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const axes = new THREE.AxesHelper(10);
  scene.add(axes);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight("#fff");
  scene.add(ambientLight);

  return { scene, camera, controls, renderer };
};
