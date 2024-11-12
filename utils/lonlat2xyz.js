import * as THREE from 'three'

/**
 * @param {number} R 半径
 * @param {number} longitude 经度
 * @param {number} latitude 纬度
 * @returns {THREE.Vector3}
 * */
export const lon2xyz = (R, longitude, latitude) => {
    let lon = longitude * Math.PI / 180; // 转弧度值
    const lat = latitude * Math.PI / 180; // 转弧度值
    lon = -lon; // js坐标系z坐标轴对应经度-90度，而不是90度

    // 经纬度坐标转球面坐标计算公式
    const x = R * Math.cos(lat) * Math.cos(lon);
    const y = R * Math.sin(lat);
    const z = R * Math.cos(lat) * Math.sin(lon);
    // 返回球面坐标
    return new THREE.Vector3(x, y, z);
}

/**
 * @param {number} R 半径
 * @param {number[][]} coordinates 经度[lon,lat][]
 * @returns {number[]}
 * */
export const lon2xyzs = (R, coordinates) => {
    const dataSet = []
    coordinates.forEach((lonlat) => {
        let lon = lonlat[0] * Math.PI / 180; // 转弧度值
        const lat = lonlat[1] * Math.PI / 180; // 转弧度值
        lon = -lon; // js坐标系z坐标轴对应经度-90度，而不是90度

        // 经纬度坐标转球面坐标计算公式
        const x = R * Math.cos(lat) * Math.cos(lon);
        const y = R * Math.sin(lat);
        const z = R * Math.cos(lat) * Math.sin(lon);
        dataSet.push(x, y, z)
    })
    // 返回球面坐标
    return dataSet;
}