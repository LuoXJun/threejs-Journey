import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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

const geo = new THREE.BoxGeometry(3, 3, 3)
const mat = new THREE.MeshBasicMaterial({ color: 'red' })

const mesh = new THREE.InstancedMesh(geo, mat, 10)


for (let i = 0; i < 10; i++) {
    const color = new THREE.Color(
        `rgb(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},0)`
    );
    mesh.setColorAt(i, color);
    mesh.instanceColor.needsUpdate = true;


    mesh.setMatrixAt(i, mesh.matrix);
    mesh.instanceMatrix.needsUpdate = true;
}

scene.add(mesh)
console.log(scene);

const axes = new THREE.AxesHelper(10)
scene.add(axes)

const controls = new OrbitControls(camera, canvas)


const animate = () => {

    requestAnimationFrame(animate)
    controls.update()

    renderer.render(scene, camera)
}

animate()