import * as THREE from "three";
import { importTexture } from "../../utils/importAssets";
import { mm } from "../../utils/THREE.MeshLine/THREE.MeshLine1";
import { getPoints } from "../../utils/getPoint";
import flowline_frag from "./shaders/flowline.glsl?raw";
window.THREE = THREE;
mm.call(window);
const MeshLineMaterial = window.MeshLineMaterial;
const MeshLine = window.MeshLine;


/**
 * @description 创建行政区域边界线
 * @param {number} radius 地球半径
 * */
export const createRegion = async (radius) => {
  // 行政区域流动线
  const polylines = await getPoints(radius);
  const group = new THREE.Group();

  // 线材质
  const loader = new THREE.TextureLoader();
  const lineMap = loader.load(importTexture("cm_gray.png"));
  const flowLineMat = new MeshLineMaterial({
    transparent: true,
    lineWidth: 0.01,
    color: "red",
    fragmentShader: flowline_frag,
    customUniforms: {
      lineMap: {
        value: lineMap,
      },
      utime: {
        value: 0,
      },
      flowSpeed: {
        value: 0.005,
      },
    },
  });

  polylines.forEach((pts) => {
    const gg = new THREE.BufferGeometry().setFromPoints(pts);
    const lineGeo = new MeshLine();
    lineGeo.setGeometry(gg);

    group.add(new THREE.Mesh(lineGeo, flowLineMat));
  });

  group.children[0].onBeforeRender = () => {
    flowLineMat.uniforms.utime.value += 1;
  };

  return { group };
};
