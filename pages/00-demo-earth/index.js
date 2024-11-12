import * as THREE from "three";
import { importTexture } from "../../utils/importAssets";
import { createScene } from "../../utils/createScene";
import { useModel } from "../../useModel/useModel";
import { createUnrealbloom } from "./createUnrealbloom";
import { createRegion } from "./createRegion";
import { createMigrate } from "./createMigrate";

const { scene, camera, controls, renderer } = createScene();
const loader = new THREE.TextureLoader();

/* 地球球半径 */
const radius = 3;
const map = loader.load(importTexture("地球展开图有色.jpg"));
const g = new THREE.SphereGeometry(radius, 32, 32);
const m = new THREE.MeshBasicMaterial({
  map,
});
const sphere = new THREE.Mesh(g, m);
scene.add(sphere);

/* 添加行政区域边界 */
const { group: regionGroup } = await createRegion(radius);
scene.add(regionGroup);

/* 添加运动模型 */
useModel(scene, radius);

/* 添加辉光效果 */
const { bloomComposer, finalComposer, setLayer } = createUnrealbloom(renderer, scene, camera);
const bloomLayer = 1;
// 需要添加辉光效果的对象
const bloomList = [camera, ...regionGroup.children];

/* 添加迁徙线 */
const linesGroup = createMigrate(radius);
scene.add(linesGroup);

/* 动画 */
const animate = () => {
  controls.update();

  setLayer(bloomList, bloomLayer);
  bloomComposer.render();
  setLayer(bloomList, 0);
  finalComposer.render();

  requestAnimationFrame(animate);
};

animate();
