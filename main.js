import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


import MidiHandler from './midiInput';
import { pianoSounds,TextArray } from './instruments';

import {initializeKeyboardInput } from './computerKBInput';

const getInstrumentNumber = () => instrumentNumber;

initializeKeyboardInput(playSound, getInstrumentNumber);



let instrumentNumber = 0;


const midiHandler = new MidiHandler(instrumentNumber, playSound);




//todo add max zoomout level
//todo add modal for click to initialize sound but i think ive done that lol




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



//adding text
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)

labelRenderer.domElement.style.position = "absolute"
labelRenderer.domElement.style.top = "0px"
labelRenderer.domElement.style.pointerEvents = "none"
document.body.appendChild(labelRenderer.domElement)

let keyboardText = document.createElement("p")
keyboardText.textContent = TextArray[instrumentNumber];
keyboardText.style.fontSize = '30px';
keyboardText.style.fontFamily = "comic Sans MS"
const cPointLabel = new CSS2DObject(keyboardText)
scene.add(cPointLabel);
cPointLabel.position.set(0,0,0)




var light = new THREE.AmbientLight(0xffffff,0.5);
scene.add(light);

let screenObject = null;
let noteToObjectMap = {};


const loader = new GLTFLoader();
loader.load("assets/NewNamesPiano.gltf", (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);

    model.traverse((child) => {
        if (child.name.startsWith("Key")) {
            const note = child.name.split('_')[1];
            noteToObjectMap[note] = child;
        }
        
        if (child.name === "Screen") {
            screenObject = child;
        }

    });

    scene.add(model);
});

function animate() {
    if (screenObject && cPointLabel) {
        cPointLabel.position.set(0.00008872120815794915,0.45154336750507355,-0.7542221546173096);
    }
    

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(this.window.innerWidth, this.window.innerHeight);
}
);



function playSound(noteName, instNumber) {
    const keyObject = noteToObjectMap[noteName];


    if (keyObject) {
        highlightObject(keyObject, blueColour);

        
        if (highlightTimers.has(keyObject)) {
            clearTimeout(highlightTimers.get(keyObject));
        }

        
        const timer = setTimeout(() => {
            resetHighlightedObject()
            clearAllHighlights() 
        }, 60); 

        highlightTimers.set(keyObject, timer);
    }

    pianoSounds[instNumber].playSound(noteName);
}

let lastHoveredKey = null;


function getPointerPosition(event) {
    return {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
    };
}


const originalMaterials = new Map();

let highlightedObjects = [];


const highlightTimers = new Map();

function highlightObject(object, color) {
    if (object) {
        
        originalMaterials.set(object, object.material);
        const highlightMaterial = new THREE.MeshBasicMaterial({ color: color });
        object.material = highlightMaterial;
        highlightedObjects.push(object);

    }
}

function resetHighlightedObject(object) {
    if (object) {
        object.material = originalMaterials.get(object);
        highlightedObjects = highlightedObjects.filter(obj => obj !== object);
    }
}


function clearAllHighlights() {
    highlightedObjects.forEach(resetHighlightedObject);
    highlightedObjects = [];
}


function handleInstrumentChange(direction) {
    instrumentNumber += direction;
    const totalInstruments = pianoSounds.length;

    if (instrumentNumber < 0) {
        instrumentNumber = totalInstruments - 1;
    } else if (instrumentNumber >= totalInstruments) {
        instrumentNumber = 0;
    }
}

const blueColour =  0x0000FF 

let currentlyHoveredObject = null;

function objectSelect(event) {
    const raycaster = new THREE.Raycaster();
    const pointerPosition = getPointerPosition(event);
    raycaster.setFromCamera(pointerPosition, camera);

    const intersects = raycaster.intersectObjects(Object.values(noteToObjectMap)); 
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const objectName = intersectedObject.name;

        if (objectName.startsWith("Key")) {
            const note = objectName.split('_')[1];
            if (intersectedObject !== currentlyHoveredObject) {
                playSound(note, instrumentNumber);
                currentlyHoveredObject = intersectedObject;
            }
        } else {
            currentlyHoveredObject = null;
        }

        if (event.type === 'click') {
            if (objectName === "Selector_Left") {
                handleInstrumentChange(-1);
            } else if (objectName === "Selector_Right") {
                handleInstrumentChange(1);
            }
            keyboardText.textContent = TextArray[instrumentNumber];
        }
        
    } else {
        currentlyHoveredObject = null;    
    }}



window.addEventListener("mousemove", objectSelect);
window.addEventListener("click", objectSelect);