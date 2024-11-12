import * as THREE from "three";
import { createScene } from "../../utils/createScene";
const { scene, camera, controls, renderer } = createScene();

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  renderer.render(scene, camera);
};

animate();
