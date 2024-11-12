/**
 * @description 模型资源路径
 * @param {string} name 模型名称-默认处于assets/models/路径下
 * */
export const importModel = (name) => {
  return new URL(`../assets/models/${name}`, import.meta.url).href;
};

/**
 * @description 贴图资源路径
 * @param {string} name 贴图名称-默认处于assets/texture/路径下
 * */
export const importTexture = (name) => {
  return new URL(`../assets/texture/${name}`, import.meta.url).href;
};

/**
 * @description json资源路径
 * @param {string} name json名称-默认处于assets/json/路径下
 * */
export const importJson = (name) => {
  return new URL(`../assets/json/${name}`, import.meta.url).href;
};
