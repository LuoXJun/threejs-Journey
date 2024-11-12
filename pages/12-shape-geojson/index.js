import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('.canvas')

const scene = new THREE.Scene()

const sizes = [1400, 700]
const camera = new THREE.PerspectiveCamera(45, sizes[0] / sizes[1], 0.1, 10000)
camera.lookAt(new THREE.Vector3(0, 0, 0))
camera.position.set(0, 20, 20)

const renderer = new THREE.WebGLRenderer({
    canvas,
})
renderer.setSize(sizes[0], sizes[1])

const controls = new OrbitControls(camera, canvas)

const axes = new THREE.AxesHelper(10)
scene.add(axes)


const animate = () => {

    requestAnimationFrame(animate)
    controls.update()

    renderer.render(scene, camera)
}

animate()

/* 处理数据 */
const json = await fetch('../../assets/geojson/china.geojson').then(json => json.json())

const polylines = []
let i = 0
json.features.forEach(feature => {
    if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach((item) => {
            item[0].forEach((coordinates) => {
                if (!polylines[i]) polylines[i] = []
                polylines[i].push(new THREE.Vector2(coordinates[0] / 180, coordinates[1] / 180))
            })
            i += 1
        })
    }
})

const depth = 0.01;
const extrudeSettings = {
    curveSegments: 12,
    steps: 1,
    depth,
    bevelEnabled: true,
    bevelThickness: 0,
    bevelSize: 0,
    bevelOffset: 0,
    bevelSegments: 1
};
const mat = new THREE.LineBasicMaterial({ color: 'red' })
const group = new THREE.Group()
polylines.forEach(pts => {
    const shapeGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(shapeGeo, mat)
    const line2 = line.clone()
    line.position.z += depth
    group.add(line)
    group.add(line2)

    const shape = new THREE.Shape(pts)
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)

    const color = new THREE.Color(`rgb(125,${Math.random().toFixed(0) * 255},${Math.random().toFixed(0) * 255})`);
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const mesh = new THREE.Mesh(geo, m)
    group.add(mesh)
})
group.rotation.x = -Math.PI / 2
group.scale.setScalar(100)
group.translateX(-60)
group.translateY(-20)
scene.add(group)

