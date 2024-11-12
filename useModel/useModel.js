import { loadModel } from "../utils/loadModel";
import { lon2xyz } from "../utils/lonlat2xyz";
import { importJson } from "../utils/importAssets";
/**
 * @description  在场景中添加回运动的模型
 * @param {THREE.Scene} scene
 * @param {number} [radius] 经纬度转三维坐标需要的半径 pts未传时需要传
 * @param {THREE.Vector3[]} [pts] 模型移动路径
 * */
export const useModel = async (scene, radius, pts) => {
  if (!pts) {
    // 卫星轨迹飞线
    const { data } = await fetch(importJson("卫星轨迹线3.json")).then((json) => json.json());
    const lines = [];

    data.forEach((item) => {
      lines.push(lon2xyz(radius + 0.2, item.lon, item.lat));
    });
    pts = lines;
  }
  /** @type {THREE.Group} */
  let model;

  const loaded = (gltf) => {
    model = gltf.scene;
    model.scale.setScalar(0.1);

    model.traverse(function (child) {
      if (child.isMesh) {
        //模型自发光
        child.material.emissive = child.material.color;
        child.material.emissiveMap = child.material.map;
      }
    });
    const model1 = model.clone();

    scene.add(model);
    scene.add(model1);

    const speed = 2;
    const clock = new THREE.Clock();
    const matrix4 = new THREE.Matrix4();
    const curve3 = new THREE.CatmullRomCurve3(pts);
    const quate = new THREE.Quaternion();
    const defaultEuler = new THREE.Euler(0, -Math.PI / 2, 0);
    const defaultMatrix4 = new THREE.Matrix4();
    const defaultUp = new THREE.Vector3(0, 1, 0);

    const models = [model, model1];

    const animate = () => {
      if (!model) return;
      requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      models.forEach((model, i) => {
        const p = curve3.getPointAt(
          (((t + i * 5) * speed) % curve3.getLength()) / curve3.getLength()
        );
        matrix4.lookAt(model.position.clone(), p, defaultUp);
        matrix4.multiply(defaultMatrix4.makeRotationFromEuler(defaultEuler));
        const rota = quate.setFromRotationMatrix(matrix4);
        model.quaternion.copy(rota);
        model.position.copy(p);
      });
    };

    animate();
  };

  // 模型加载
  loadModel("ice_sword.glb", loaded);
};
