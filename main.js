import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import MidiHandler from './midiInput';
import { pianoSounds,TextArray } from './instruments';
import {initializeKeyboardInput } from './computerKBInput';
import { loadMidiFile } from './midiFileHandler';


// put this in seperate file
document.getElementById('loadSmallPiano').addEventListener('click', function() {
    loadPianoModel('smaller_piano.gltf');
});

document.getElementById('loadBigPiano').addEventListener('click', function() {
    loadPianoModel('bigger_piano.gltf');
});


document.getElementById('midiFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        loadMidiFile(file, playSound, getInstrumentNumber);
    }
});


const getInstrumentNumber = () => instrumentNumber;

initializeKeyboardInput(playSound, getInstrumentNumber);

let instrumentNumber = 0;
const midiHandler = new MidiHandler(instrumentNumber, playSound);



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
camera.position.set(0.11, 5.5, 4);
orbit.maxDistance = 15 
orbit.enablePan = false;
orbit.update();

scene.background = new THREE.Color(0xC5FFF8);


//adding text
//TODO ONLY ON ONE SURFACE OR WHATNOT SO DIFFERENT NOT STATIONARY!

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


var light = new THREE.HemisphereLight(0xffffff,0.5);
scene.add(light);

let screenObject = null;

let noteToObjectMap = {};


let Selector_Left = null

let Selector_Right = null

const loader = new GLTFLoader();
function loadPianoModel(filename) {
    loader.load(`assets/${filename}`, (gltf) => {
        if (scene.children.some(child => child.name === "PianoModel")) {
            const existingModel = scene.children.find(child => child.name === "PianoModel");
            scene.remove(existingModel);
        }

        const model = gltf.scene;
        model.name = "PianoModel";
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        scene.add(model);

        noteToObjectMap = {};

        model.traverse((child) => {
            if (child.name.startsWith("Key")) {
                const note = child.name.split('_')[1];
                noteToObjectMap[note] = child; 
            }
            
            if (child.name === "Screen") {
                screenObject = child;
            }
            if (child.name.startsWith("Selector_Left")) {
                Selector_Left = child; 
            }
            if (child.name.startsWith("Selector_Right")) {
                Selector_Right = child; 
            }
        });

        highlightedObjects.forEach(obj => resetHighlightedObjects(obj));
        highlightedObjects = [];

        keyboardText.textContent = TextArray[instrumentNumber];
    });
}
loadPianoModel("bigger_piano.gltf");

//smaller_piano.gltf
//bigger_piano.gltf
function animate() {
    if (screenObject && cPointLabel) {
        cPointLabel.position.set(0.1000000,0.45154336750507355,-0.3542221546173096);
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
    }
    pianoSounds[instNumber].playSound(noteName);
    
}

function getPointerPosition(event) {
    const canvasBounds = renderer.domElement.getBoundingClientRect();
    return {
        x: ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1,
        y: -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1
    };
}

const originalMaterials = new Map();

let highlightedObjects = [];


function highlightObject(object, color) {
    if (object) {
       
        if (!originalMaterials.has(object)) {
            originalMaterials.set(object, object.material);
        }
        const highlightMaterial = new THREE.MeshBasicMaterial({ color: color });

        object.material = highlightMaterial;

        if (!highlightedObjects.includes(object)) {
            highlightedObjects.push(object);
        }
    }
}

function resetHighlightedObjects(object) {
    if (object && originalMaterials.has(object)) {
        object.material = originalMaterials.get(object);
        originalMaterials.delete(object);
    }
}


//TODO MAKE + /- CHANGE INSTRUMENT IN OTHER FILE
function handleInstrumentChange(direction) {
    instrumentNumber += direction;
    const totalInstruments = pianoSounds.length;
    if (instrumentNumber < 0) {
        instrumentNumber = totalInstruments - 1;
    } else if (instrumentNumber >= totalInstruments) {
        instrumentNumber = 0;
    }
    keyboardText.textContent = TextArray[instrumentNumber];
}

const blueColour =  0x0000FF

function getRelevantObjectsForRaycasting() {
    let relevantObjects = Object.values(noteToObjectMap).filter(obj => obj.name.startsWith("Key"));
    if (Selector_Left) relevantObjects.push(Selector_Left);
    if (Selector_Right) relevantObjects.push(Selector_Right);
    return relevantObjects;
}

const raycastThrottleInterval = 40; 

let raycastThrottleTimeout = null;


function objectSelect(event) {

    if (raycastThrottleTimeout) return; 

    raycastThrottleTimeout = setTimeout(() => {
        performRaycasting(event); 
        raycastThrottleTimeout = null; 
    }, raycastThrottleInterval);
}



//mouse hover
let currentlyHoveredObjects = new Set();

function performRaycasting(event) {


    let actionPerformedForLeftSelector = false;
    let actionPerformedForRightSelector = false;

    const raycaster = new THREE.Raycaster();
    const pointerPosition = getPointerPosition(event);
    raycaster.setFromCamera(pointerPosition, camera);

    const relevantObjects = getRelevantObjectsForRaycasting();
    const intersects = raycaster.intersectObjects(relevantObjects);


    let newlyHoveredObjects = new Set();
    
    if (intersects.length > 0) {


        intersects.forEach(intersect => {
            const intersectedObject = intersect.object;

            if (intersectedObject.name.startsWith("Selector_Left")) {
                newlyHoveredObjects.add(intersectedObject);
                if (!currentlyHoveredObjects.has(intersectedObject) && !actionPerformedForLeftSelector) {
                    console.log("Hi from Left Selector");
                    handleInstrumentChange(-1);
                    highlightObject(intersectedObject, blueColour);
                    actionPerformedForLeftSelector = true;
                }
            } 
            else if (intersectedObject.name.startsWith("Selector_Right")) {
                newlyHoveredObjects.add(intersectedObject);
                if (!currentlyHoveredObjects.has(intersectedObject) && !actionPerformedForRightSelector) {
                    console.log("Hi from Right Selector");
                    handleInstrumentChange(1);
                    highlightObject(intersectedObject, blueColour);
                    actionPerformedForRightSelector = true;
                }
            }


            if (intersectedObject.name.startsWith("Key")) {
                let noteName = intersectedObject.name.split('_')[1];
                newlyHoveredObjects.add(intersectedObject);

                if (!currentlyHoveredObjects.has(intersectedObject)) {
                    playSound(noteName, instrumentNumber);
                    highlightObject(intersectedObject,blueColour);  
                }
            }
        });
    }
    currentlyHoveredObjects.forEach(object => {
        if (!newlyHoveredObjects.has(object)) {
            resetHighlightedObjects(object);
        }
    });

    currentlyHoveredObjects = new Set(newlyHoveredObjects);
}

window.addEventListener("mousemove", objectSelect);



export{resetHighlightedObjects,noteToObjectMap,handleInstrumentChange}