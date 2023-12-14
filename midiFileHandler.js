import { Midi } from '@tonejs/midi';
import { resetHighlightedObjects, noteToObjectMap } from './main';


let speed = 0

//TODO add it so you can go through the song at a specific time 0:23 seconds for example

// const rangeInput = document.getElementById("MidiSpeed");
// const currentValueSpan = document.getElementById("currentValue");

// rangeInput.value = 1;
// currentValueSpan.textContent = 1;


// rangeInput.addEventListener("input", function () {
//     const displayedSpeed = parseFloat(rangeInput.value);
//     speed = 1 / displayedSpeed;
//     currentValueSpan.textContent = displayedSpeed;
// });

function loadMidiFile(file, playSound, getInstrumentNumber, jumpToTime = 0) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const midi = new Midi(e.target.result);
        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                if (note.time >= jumpToTime) {
                    setTimeout(() => {
                        const instrumentNumber = getInstrumentNumber();
                        playSound(note.name, instrumentNumber);
                        
                        setTimeout(() => {
                            resetHighlightedObjects(noteToObjectMap[note.name]);
                        }, note.duration * 1000 / speed); 
                    }, (note.time - jumpToTime) * 1000 * speed); 

                    console.log(speed)
                   
                }
            });
        });
    };

    reader.readAsArrayBuffer(file);
}



export {loadMidiFile}