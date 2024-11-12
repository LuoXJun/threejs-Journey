import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import unrealbloom_frag from "./shaders/unrealbloom_frag.glsl?raw";
import unrealbloom_vert from "./shaders/unrealbloom_vert.glsl?raw";

/**
 * @description 为选中对象添加辉光效果
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.PerspectiveCamera} camera
 * */
export const createUnrealbloom = (renderer, scene, camera) => {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  //色调映射
  renderer.toneMappingExposure = 0.8;
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

  /* 创建雪花通道 */
  // const glitchPass = new GlitchPass();
  // glitchPass.renderToScreen = false;
  // const glitchComposer = new EffectComposer(renderer);
  // glitchComposer.renderToScreen = false;
  // glitchComposer.addPass(renderScene);
  // glitchComposer.addPass(glitchPass);

  // 混合通道
  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: unrealbloom_vert,
      fragmentShader: unrealbloom_frag,
      defines: {},
    }),
    "baseTexture"
  );
  mixPass.needsSwap = true;

  const outputPass = new OutputPass();
  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(mixPass);
  finalComposer.addPass(outputPass);

  /**
   * @param {THREE.Object3D[]} object
   * */
  const setLayer = (object, layer) => {
    object.forEach((item) => {
      item.layers.set(layer);
    });
  };

  return { bloomComposer, finalComposer, setLayer };
};
