import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

//todo add max zoomout level

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



const loader = new GLTFLoader();
loader.load("assets/NewPiano.gltf", (gltf) => {
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


//raycasting/mouse detection

const raycaster = new THREE.Raycaster();
const pointer  = new THREE.Vector2();

let pianoKeys = ["A_Key001","B_Key001","C_Key001","D_Key001","E_Key001","F_Key001","G_Key001","A_Key002","B_Key002","C_Key002","D_Key002","E_Key002","F_Key002","G_Key002","A_Key003"]
let blackKeys = ["C#_Key001","D#_Key001","F#_Key001","G#_Key001","A#_Key001","C#_Key002","D#_Key002","F#_Key002","G#_Key002","A#_Key002"]


const onMouseMove = (event) => {
    //todo fix this code because it's terrible! keep for now to keep momentum
    //change key names to start with Key then do the name then if they're hovered over do the blue thing then reset it will look into it later just want to implement more stuff

    const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF });
    const whiteMaterial = new  THREE.MeshBasicMaterial({ color: 0x646464 });
    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    //constantly setting the keys the colour, 
    pianoKeys.forEach((key) => {
    const object = scene.getObjectByName(key);
    if (object) {
        object.material = whiteMaterial;
    }
    });

    blackKeys.forEach((key) => {
    const object = scene.getObjectByName(key);
    if (object) {
        object.material = blackMaterial;
    }
    });
      
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer,camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i=0; i<intersects.length; i++) {
        const object = intersects[i].object;

        //DEBUG keyname
        // console.log(object.name)

        
        if (pianoKeys.includes(object.name)|| blackKeys.includes(object.name)) {
            object.material = blueMaterial;
        }
        
}  }

window.addEventListener("mousemove",onMouseMove);