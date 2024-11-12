import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const canvas = document.querySelector('.canvas')

const scene = new THREE.Scene()

const sizes = [1400, 700]
const camera = new THREE.PerspectiveCamera(45, sizes[0] / sizes[1], 0.1, 10000)
camera.lookAt(new THREE.Vector3(0, 0, 0))
camera.position.set(10, 5, 10)

const renderer = new THREE.WebGLRenderer({
    canvas,
})
renderer.setSize(sizes[0], sizes[1])

const axes = new THREE.AxesHelper(10)
scene.add(axes)

const controls = new OrbitControls(camera, canvas)

const json = await fetch('../../assets/geojson/city-demo/贵阳市界.geojson').then(json => json.json())
/** @type {[number,number][]} */
let data = json.features[0].geometry.coordinates[0];
data = data.map(item => {
    return new THREE.Vector2(item[0], item[1])
})

const loader = new THREE.TextureLoader()
const map = loader.load('../../assets/texture/waternormals.jpg')
map.wrapS = THREE.RepeatWrapping
map.wrapT = THREE.RepeatWrapping
const mat = new MeshLineMaterial({ map, useMap: true, lineWidth: 0.01, sizeAttenuation: true })
const shape = new THREE.Shape(data)

const geo = new THREE.ShapeGeometry(shape)
geo.center()
const lineGeo = new MeshLine()
lineGeo.setGeometry(geo)

const polygon = new THREE.Mesh(lineGeo, mat);
polygon.rotation.x = Math.PI / -2
scene.add(polygon)


const animate = () => {

    requestAnimationFrame(animate)
    controls.update()

    renderer.render(scene, camera)
}

animate()