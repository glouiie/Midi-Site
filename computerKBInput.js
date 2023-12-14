import { resetHighlightedObjects,noteToObjectMap,handleInstrumentChange } from "./main";

let octave = 3;

let PRESSED_KEYS = new Set();
const pressableKeys = getPressableKeys(); //immutable so fine


//MINOR BUG if you change octaves the keys dont reset their highlights to fix change scope of notename and what not OR refactor so reset can be used globally

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

function handleKeyDown(event, playSoundFunction, getInstrumentNumber) {
    const keyPressed = event.key.toUpperCase();

    if (!PRESSED_KEYS.has(keyPressed)) {
        if (keyPressed === 'Z' && octave > 1) {
            octave -= 1;
        }
        if (keyPressed === 'X' && octave < 5) {
            octave += 1;
        }

        if (keyPressed === '=' || keyPressed === '-') {
            const direction = keyPressed === '+' ? 1 : -1;
            handleInstrumentChange(direction);
        }

        if (pressableKeys.hasOwnProperty(keyPressed)) {
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

    if (pressableKeys.hasOwnProperty(keyReleased)) {
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
