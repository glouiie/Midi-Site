import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import MidiHandler from "./midiInput";
import { pianoSounds,TextArray } from "./instruments";
import {initializeKeyboardInput } from "./computerKBInput";
import { loadMidiFile } from "./midiFileHandler";

// put this in seperate file or dont idc
document.getElementById("loadSmallPiano").addEventListener("click", function() {
    loadPianoModel("smaller_piano.gltf");
});

document.getElementById("loadBigPiano").addEventListener("click", function() {
    loadPianoModel("bigger_piano.gltf");
});


document.getElementById("midiFileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        loadMidiFile(file, playSound, getInstrumentNumber);
    }
});

const getInstrumentNumber = () => instrumentNumber;

initializeKeyboardInput(playSound, getInstrumentNumber);

let instrumentNumber = 0;
const midiHandler = new MidiHandler(instrumentNumber, playSound);

//scene setup
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
var light = new THREE.HemisphereLight(0xffffff,0.5);
scene.add(light);

function animate() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

//adding text to screen
function updateInstrumentLabel(instrumentName) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 850; 
    canvas.height = 300;
    //flip the text upside down otherwise it doesnt work
    context.translate(0, canvas.height);
    context.scale(1, -1);
  
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = `150px Comic Sans MS`;
    context.fillStyle = "black";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(instrumentName, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true; 
    texture.minFilter = THREE.LinearFilter; 

    scene.traverse((object) => {
        if (object.material && object.material.name === "Front Face") {
            object.material.map = texture;
            object.material.transparent = true;
            object.material.needsUpdate = true;
        }
    });
}

let noteToObjectMap = {};
let Selector_Left = null
let Selector_Right = null




let pianoModelName = "" //to fix a bug of playing notes that arent there

const loader = new GLTFLoader();
function loadPianoModel(filename) {

    pianoModelName = filename;



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

        model.traverse((child) => {
            if (child.name.startsWith("Key")) {
                const note = child.name.split("_")[1];
                noteToObjectMap[note] = child; 
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
        updateInstrumentLabel(TextArray[instrumentNumber])
    });

}
loadPianoModel("smaller_piano.gltf");
//smaller_piano.gltf
//bigger_piano.gltf


window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    }
);

function getPointerPosition(event) {
    const canvasBounds = renderer.domElement.getBoundingClientRect();
    return {
        x: ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1,
        y: -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1
    };
}

const originalMaterials = new Map();

let highlightedObjects = [];



const blueColour =  0x0000FF
function resetHighlightedObjects(object) {
    if (object && originalMaterials.has(object)) {
        object.material = originalMaterials.get(object);
        originalMaterials.delete(object);
    }
}


function objectSelect(event) {
    if (raycastThrottleTimeout) return; 
    raycastThrottleTimeout = setTimeout(() => {
        performRaycasting(event); 
        raycastThrottleTimeout = null; 
    }, raycastThrottleInterval);
}
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

//mouse hover
function getRelevantObjectsForRaycasting() {
    let relevantObjects = Object.values(noteToObjectMap).filter(obj => obj.name.startsWith("Key"));
    if (Selector_Left) relevantObjects.push(Selector_Left);
    if (Selector_Right) relevantObjects.push(Selector_Right);
    return relevantObjects;
}
const raycastThrottleInterval = 40; 
let raycastThrottleTimeout = null;
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
                    handleInstrumentChange(-1);
                    highlightObject(intersectedObject, blueColour);
                    actionPerformedForLeftSelector = true;
                }
            } 
            else if (intersectedObject.name.startsWith("Selector_Right")) {
                newlyHoveredObjects.add(intersectedObject);
                if (!currentlyHoveredObjects.has(intersectedObject) && !actionPerformedForRightSelector) {
                    handleInstrumentChange(1);
                    highlightObject(intersectedObject, blueColour);
                    actionPerformedForRightSelector = true;
                }
            }
            if (intersectedObject.name.startsWith("Key")) {
                let noteName = intersectedObject.name.split("_")[1];
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


//music stuff
function playSound(noteName, instNumber) {
    const note = noteName.slice(0, -1);
    const octave = parseInt(noteName.slice(-1));

    let minNote, minOctave, maxNote, maxOctave;

    //this is a really bad fix for a bug so that you cant play invisible notes but the performance is still fine so....
    //but it also makes it only play the notes that can be seen when importing the song so win win!
    if (pianoModelName === "bigger_piano.gltf"){
        minNote = "C";
        minOctave = 1;
        maxNote = "E";
        maxOctave = 6;
    }

    if (pianoModelName === "smaller_piano.gltf"){
        minNote = "C";
        minOctave = 3;
        maxNote = "C";
        maxOctave = 5;
    }

    // Make sure it"s in the keyboard models range
    if ((octave > minOctave || (octave === minOctave && note >= minNote)) &&
        (octave < maxOctave || (octave === maxOctave && note <= maxNote))) { 
        
        const keyObject = noteToObjectMap[noteName];
        if (keyObject) {
            highlightObject(keyObject, blueColour);
        }
        pianoSounds[instNumber].playSound(noteName);
    } 
}



function handleInstrumentChange(direction) {
    instrumentNumber += direction;
    const totalInstruments = pianoSounds.length;
    if (instrumentNumber < 0) {
        instrumentNumber = totalInstruments - 1;
    } else if (instrumentNumber >= totalInstruments) {
        instrumentNumber = 0;
    }
    updateInstrumentLabel(TextArray[instrumentNumber])
}

export{resetHighlightedObjects,noteToObjectMap,handleInstrumentChange,playSound, getInstrumentNumber}