import { Midi } from '@tonejs/midi';
import { resetHighlightedObjects, noteToObjectMap, playSound, getInstrumentNumber } from './main';

let currentFile; 
let timeouts = []; 

let currentStartTime = 0; 

let settingLoopStart = true;
let loopStartTime = 0;
let loopEndTime = 0;
let isLooping = false;

let currentPlaybackSpeed = 1;

//playback DOM elements
document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById('midiSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');
    const setLoopButton = document.getElementById('setLoopButton');
    const clearLoopButton = document.getElementById('clearLoopButton');

    function updateSliderDisplay() {
        sliderValueDisplay.textContent = slider.value + 's / ' + slider.max + 's';
    }

    function updateMidiLength(newLength) {
        slider.max = newLength;
        updateSliderDisplay();
    }

    function onSliderInput() {
        updateSliderDisplay();
    }

    function onSliderChange() {
        seekToTime(parseInt(slider.value));
    }

    function toggleLoopSetting() {
        if (settingLoopStart) {
            setLoopStart();
        } else {
            setLoopEnd();
        }
    }

    function setLoopStart() {
        loopStartTime = parseInt(slider.value);
        setLoopButton.textContent = 'Set Loop End';
        settingLoopStart = false;
    }

    function setLoopEnd() {
        loopEndTime = parseInt(slider.value);
        setLoopButton.textContent = 'Set Loop Start';
        settingLoopStart = true;
        isLooping = true;
    }

    function clearLoopPoints() {
        setLoopButton.textContent = 'Set Loop Start';
        settingLoopStart = true;
    }

    function setPlaybackSpeed(speed) {
        currentPlaybackSpeed = speed;
        if (currentFile) {
            seekToTime(parseInt(document.getElementById('midiSlider').value));
        }
    }

    
    function clearLoopPoints() {
        isLooping = false;
    }

    slider.addEventListener('input', onSliderInput);
    slider.addEventListener('change', onSliderChange);
    setLoopButton.addEventListener('click', toggleLoopSetting);
    clearLoopButton.addEventListener('click', clearLoopPoints);
    
    document.getElementById('halfSpeed').addEventListener('click', () => setPlaybackSpeed(2));
    document.getElementById('normalSpeed').addEventListener('click', () => setPlaybackSpeed(1));
    document.getElementById('doubleSpeed').addEventListener('click', () => setPlaybackSpeed(0.5));

    window.updateMidiLength = updateMidiLength;
});



function checkLoopBoundary(time) {
    if (isLooping && time >= loopEndTime) {
        seekToTime(loopStartTime);
    }
}

function loadMidiFile(file, playSound, getInstrumentNumber, startTime = 0) {

    stopCurrentPlayback();

    currentFile = file;
    currentStartTime = startTime;
    const reader = new FileReader();

    reader.onload = function(e) {
        const midi = new Midi(e.target.result);
        updateMidiLength(Math.floor(midi.duration / currentPlaybackSpeed)); 

        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                const noteStartTime = note.time * currentPlaybackSpeed;
                const noteEndTime = noteStartTime + (note.duration * currentPlaybackSpeed);

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

function stopCurrentPlayback() {
    timeouts.forEach(timeout => clearTimeout(timeout));
    timeouts = [];

    resetSliderAndStartTime();
}

function updateSliderPosition(time) {
    const slider = document.getElementById('midiSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');
    const roundedTime = Math.floor(time); 
    slider.value = roundedTime;
    sliderValueDisplay.textContent = roundedTime + 's / ' + slider.max + 's';

    checkLoopBoundary(roundedTime);
}

function resetSliderAndStartTime() {
    const slider = document.getElementById('midiSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');
    
    slider.value = 0;
    sliderValueDisplay.textContent = '0s / ' + slider.max + 's';
    currentStartTime = 0;
}

//function to skip to different playback times using a slider!
function seekToTime(newTime) {

    stopCurrentPlayback();
    loadMidiFile(currentFile, playSound, getInstrumentNumber, newTime);
    updateSliderPosition(newTime);
}

export { loadMidiFile };



//CURRENT BUGS: LOOPING WORKS WEIRDLY WITH THE CHANGE SPEED, THE SLIDER UPDATES THE OPPOSITE WAY ROUND
//THE LOOP POINTS ARE WRONG BECAUSE IT WORKS OFF OF SECONDS WHICH UPDATES WITH THE 
//add limits to where it can play notes cause it can now play notes out of range