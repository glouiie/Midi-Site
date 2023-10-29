let octave = 3;

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
        "L": `C${octave+1}`,

    };
}


function handleKeyDown(event, playSoundCallback, getInstrumentNumber) {
    const keyPressed = event.key.toUpperCase();

    if (keyPressed === 'Z' && octave > 0) {
        octave -= 1;

    }
    if (keyPressed === 'X' && octave < 5) {
        octave += 1;

    }
    
    const pressableKeys = getPressableKeys();
    if (pressableKeys.hasOwnProperty(keyPressed)) {
        const note = pressableKeys[keyPressed];
        console.log("Note Played:", note);
        if (playSoundCallback && getInstrumentNumber) {
            const instrumentNumber = getInstrumentNumber();
            playSoundCallback(note, instrumentNumber);
        }
    }
}

function initializeKeyboardInput(playSoundCallback, getInstrumentNumber) {
    document.addEventListener("keydown", (event) => handleKeyDown(event, playSoundCallback, getInstrumentNumber));
   
}

export { getPressableKeys, initializeKeyboardInput };
