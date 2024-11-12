import * as THREE from "three";
import { createScene } from "../../utils/createScene";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import vert from "./shaders/vert.glsl?raw";
import frag from "./shaders/frag.glsl?raw";

const { scene, camera, controls, renderer } = createScene();
const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshBasicMaterial({ color: "red" });
const box1 = new THREE.Mesh(geo, mat);
scene.add(box1);

const box2 = box1.clone();
box2.position.x = 3;
scene.add(box2);

const box3 = box1.clone();
box3.position.x = -3;
scene.add(box3);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* 创建渲染通道 */
const renderScene = new RenderPass(scene, camera);
/** 创建辉光通道 */
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(renderer.domElement.width, renderer.domElement.height, 0.1, 0.2, 0)
);
/* 创建辉光生成器 */
const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

/**
 * 混合通道:获取辉光后处理之后的图像而不直接渲染。是为了方便后续控制渲染
 * 例如，切换相机图层后，进行辉光后处理，得到后处理图像后再切回原图层，这时就可以使用
 * 辉光后处理后的图像进项操作
 * */
const mixPass = new ShaderPass(
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

const outputPass = new OutputPass();

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);

const animate = () => {
  controls.update();

  /**
   * 物体默认在0层，只有当物体和相机存在同层时才会被渲染
   * 利用这一特性，在后处理渲染时将不需要渲染的目标置于相机不同的层级防止渲染，后处理结束后再变回原层级
   * 同理可以将相机放至其他层级获得相反的效果
   * */
  // {
  //   /* 除了box1其他全部被选中 */
  //   box1.layers.set(1);
  //   bloomComposer.render();
  //   box1.layers.set(0);
  //   finalComposer.render();
  // }
  {
    /* 只有box1被选中 */
    box1.layers.set(1);
    camera.layers.set(1);
    bloomComposer.render();
    box1.layers.set(0);
    camera.layers.set(0);

    renderer.render(scene, camera);
    finalComposer.render();
  }

  requestAnimationFrame(animate);
};

animate();
