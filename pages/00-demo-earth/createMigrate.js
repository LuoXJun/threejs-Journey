import * as THREE from "three";
import { importTexture } from "../../utils/importAssets";
import { mm } from "../../utils/THREE.MeshLine/THREE.MeshLine1";
import flowline_frag from "./shaders/flowline.glsl?raw";
import { lon2xyz } from "../../utils/lonlat2xyz";
window.THREE = THREE;
mm.call(window);
const MeshLineMaterial = window.MeshLineMaterial;
const MeshLine = window.MeshLine;

const points = [
  [
    [110.379257, 34.600612],
    [130, 34.600612],
    [150, 34.600612],
  ],
  [
    [110.379257, 34.600612],
    [90, 34.600612],
    [70, 34.600612],
  ],
];

/**
 * @description 迁徙线
 * @param {number} radius 经纬度转世界坐标对应的球半径
 * @param {number[][][]} [pts] 迁徙线点位、经纬度
 * */
export const createMigrate = (radius, pts) => {
  if (!pts) pts = points;
  const vec3Pts = [];
  const linesGroup = new THREE.Group();

  pts.forEach((item, i) => {
    /* 调整最高点高度 */
    const height = radius * 1.5;
    const length = item.length - 1;
    item.forEach((v, index) => {
      const r = radius + (index * height) / length;
      if (!vec3Pts[i]) vec3Pts[i] = [];
      if (index <= length - index) {
        vec3Pts[i][index] = lon2xyz(r, v[0], v[1]);
        vec3Pts[i][length - index] = lon2xyz(r, item[length - index][0], item[length - index][1]);
      }
    });

    // 创建贝塞尔曲线
    const line = new THREE.CubicBezierCurve3(...vec3Pts[i]);
    const g = new THREE.BufferGeometry().setFromPoints(line.getPoints(length * 10));

    linesGroup.add(new THREE.Line(g, new THREE.LineBasicMaterial({ side: THREE.DoubleSide })));
  });

  return linesGroup;
};
