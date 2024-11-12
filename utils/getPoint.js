import { lon2xyz } from './lonlat2xyz'
import * as THREE from 'three'

/* 处理数据 */

/** 
 * 获取国家省级行政区域
 * @param {number} r 球半径 
 * @returns {Promise<THREE.Vector3[][]>}
 * */
export const getPoints = async (r) => {
    const json = await fetch('../../assets/geojson/china.geojson').then(json => json.json())
    const polylines = []
    let i = 0
    json.features.forEach(feature => {
        if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((item) => {
                item[0].forEach((coordinates) => {
                    if (!polylines[i]) polylines[i] = []
                    polylines[i].push(lon2xyz(r, coordinates[0], coordinates[1]))
                })
                i += 1
            })
        }
    })

    return polylines
}

/** 
 * 获取国家省级行政区域
 * @returns {Promise<THREE.Vector3[][]>}
 * */
export const getLonLat = async () => {
    const json = await fetch('../../assets/geojson/china.geojson').then(json => json.json())
    const polylines = []
    let i = 0
    json.features.forEach(feature => {
        if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((item) => {
                item[0].forEach((coordinates) => {
                    if (!polylines[i]) polylines[i] = []
                    polylines[i].push(new THREE.Vector2(coordinates[0], coordinates[1]))
                })
                i += 1
            })
        }
    })

    return polylines
}