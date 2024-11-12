import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getLonLat } from "../../utils/getPoint";
import frag from "./shaders/fragment.glsl?raw";
import vert from "./shaders/vertex.glsl?raw";

const canvas = document.querySelector(".canvas");

const scene = new THREE.Scene();

const sizes = [1400, 700];
const camera = new THREE.PerspectiveCamera(45, sizes[0] / sizes[1], 0.1, 10000);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.position.set(0, 20, 20);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(sizes[0], sizes[1]);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const axes = new THREE.AxesHelper(10);
scene.add(axes);

/* 处理数据 */
const polylines = await getLonLat();
const unit = 10;

/* canvas 绘制行政区域边界*/
const cvas = document.createElement("canvas");
cvas.width = 360 * unit;
cvas.height = 180 * unit;
cvas.style.background = "#000";
const ctx = cvas.getContext("2d");
// 调整中心点
ctx.translate(cvas.width / 2, cvas.height / 2);
polylines.forEach((pts) => {
  ctx.beginPath();
  pts.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x * unit, -p.y * unit);
    else ctx.lineTo(p.x * unit, -p.y * unit);
  });
  ctx.closePath();
  ctx.strokeStyle = "#fff";
  ctx.stroke();
});
const map = new THREE.CanvasTexture(cvas);

/* 球半径 */
const radius = 3;
const g = new THREE.SphereGeometry(radius, 32, 32);
const m = new THREE.ShaderMaterial({
  fragmentShader: frag,
  vertexShader: vert,
  transparent:true,
  uniforms: {
    map: {
      value: map,
    },
  },
});
const sphere = new THREE.Mesh(g, m);
sphere.rotation.y = Math.PI;
scene.add(sphere);

/* 动画 */
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  renderer.render(scene, camera);
};

animate();
