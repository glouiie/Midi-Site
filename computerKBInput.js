import { resetHighlightedObjects,noteToObjectMap,handleInstrumentChange } from "./main";

let octave = 3;

let PRESSED_KEYS = new Set();
let pressableKeys = getPressableKeys(); 

function getPressableKeys() {
    return {
        "A": `C${octave}`,
        "W": `C#${octave}`,
        "S": `D${octave}`,
        "E": `D#${octave}`,
        "D": `E${octave}`,
        "F": `F${octave}`,
        "T": `F#${octave}`,
        "G": `G${octave}`,
        "Y": `G#${octave}`,
        "H": `A${octave}`,
        "U": `A#${octave}`,
        "J": `B${octave}`,
        "K": `C${octave+1}`,
        "O": `C#${octave+1}`,
        "L": `D${octave+1}`,
        "P": `D#${octave+1}`,
        ";": `E${octave+1}`,
        "'": `F${octave+1}`,
        "]": `F#${octave+1}`,
        "#": `G${octave+1}`,

    };
}

function updatePressableKeys() {
    pressableKeys = getPressableKeys();
}

function handleKeyDown(event, playSoundFunction, getInstrumentNumber) {
    const keyPressed = event.key.toUpperCase();

    if (keyPressed === 'Z' && octave > 1) {
        octave--;

        updatePressableKeys();
    } 
    else if (keyPressed === 'X' && octave < 5) {
        octave++;
        updatePressableKeys();
    }

    if (!PRESSED_KEYS.has(keyPressed)) {
        if (keyPressed === '=' || keyPressed === '-') {
            const direction = keyPressed === '=' ? +1 : -1;
            handleInstrumentChange(direction);
        }

        if (pressableKeys[keyPressed]) {
            const note = pressableKeys[keyPressed];
            if (playSoundFunction && getInstrumentNumber) {
                const instrumentNumber = getInstrumentNumber();
                playSoundFunction(note, instrumentNumber);
            }
            PRESSED_KEYS.add(keyPressed);
        }
    }
}

function handleKeyUp(event) {
    const keyReleased = event.key.toUpperCase();
    PRESSED_KEYS.delete(keyReleased);

    if (pressableKeys[keyReleased]) {
        const noteName = pressableKeys[keyReleased];
        if (noteName && noteToObjectMap[noteName]) {
            resetHighlightedObjects(noteToObjectMap[noteName]);
        }
    }
}

function initializeKeyboardInput(playSoundFunction, getInstrumentNumber) {
    document.addEventListener("keydown", (event) => handleKeyDown(event, playSoundFunction, getInstrumentNumber));
    document.addEventListener("keyup", handleKeyUp);
}

export { getPressableKeys, initializeKeyboardInput };