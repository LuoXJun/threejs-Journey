import { importModel } from "./importAssets";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * @description 模型加载工具函数
 * @param {string} name 模型名称-默认处于assets/models/路径下
 * @param {(object: Group) => void} onLoad 模型加载成功的回调函数
 * @param {(event: ProgressEvent) => void} [onProgress] 模型加载成功的回调函数
 * @param {(event: ErrorEvent) => void} [onError] 模型加载成功的回调函数
 * */
export const loadModel = (name, onLoad, onProgress, onError) => {
  if (!name) return console.warn("未传入模型名称");
  const modelUrl = importModel(name);

  const suffix = name.split(".")[1];
  let loader;

  if (suffix === "glb") {
    loader = new GLTFLoader();
    loader.load(modelUrl, onLoad, onProgress, onError);
  }
};
