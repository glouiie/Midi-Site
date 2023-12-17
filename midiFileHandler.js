import { Midi } from '@tonejs/midi';
import { resetHighlightedObjects, noteToObjectMap, playSound, getInstrumentNumber } from './main';


document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById('midiSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');

    function updateMidiLength(newLength) {
        slider.max = newLength;
        sliderValueDisplay.textContent = '0s / ' + newLength + 's';
    }

    slider.addEventListener('input', function() {
        sliderValueDisplay.textContent = slider.value + 's / ' + slider.max + 's';
    });

    slider.addEventListener('change', function() {
        seekToTime(parseInt(slider.value));
    });
    

    window.updateMidiLength = updateMidiLength;
});

let currentFile; 
let timeouts = []; 
let currentStartTime = 0; 

function loadMidiFile(file, playSound, getInstrumentNumber, startTime = 0) {
    currentFile = file; 
    currentStartTime = startTime; 
    const reader = new FileReader();

    reader.onload = function(e) {
        const midi = new Midi(e.target.result);
        updateMidiLength(Math.floor(midi.duration)); 

        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                const noteStartTime = note.time;
                const noteEndTime = noteStartTime + note.duration;

                if (noteEndTime > startTime) {
                    const delay = Math.max(noteStartTime - startTime, 0) * 1000;
                    const duration = (noteEndTime - Math.max(startTime, noteStartTime)) * 1000;

                    const timeout = setTimeout(() => {
                        const instrumentNumber = getInstrumentNumber();
                        playSound(note.name, instrumentNumber);

                        updateSliderPosition(noteStartTime);

                        setTimeout(() => {
                            resetHighlightedObjects(noteToObjectMap[note.name]);
                        }, duration); 
                    }, delay);

                    timeouts.push(timeout); 
                }
            });
        });
    };

    reader.readAsArrayBuffer(file);
}

function updateSliderPosition(time) {
    const slider = document.getElementById('midiSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');
    const roundedTime = Math.floor(time); 
    slider.value = roundedTime;
    sliderValueDisplay.textContent = roundedTime + 's / ' + slider.max + 's';
}


function seekToTime(newTime) {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    loadMidiFile(currentFile, playSound, getInstrumentNumber, newTime);
    updateSliderPosition(newTime);
}

export { loadMidiFile };
