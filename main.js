import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xFEFEFE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0.11, 4.5, 4);
orbit.update();


var light = new THREE.AmbientLight(0xffffff,0.5);
scene.add(light);

var grid = new THREE. GridHelper(10, 10); 
scene.add(grid)

const loader = new GLTFLoader();
loader.load("assets/pianoTest.glb", (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);
});

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // console.log( camera.position ); CURRENT CAMERA
}
);


const pointer  = new THREE.Vector2() ;
const raycaster = new THREE.Raycaster();



//raycasting/mouse detection
const onMouseMove = (event) => {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer,camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i=0; i<intersects.length; i++) {
        intersects[i].object.material.color.set(0x0000FF) //blue for now
    }

}  

window.addEventListener("mousemove",onMouseMove);