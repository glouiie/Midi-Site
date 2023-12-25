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
        const actualTime = parseInt(slider.value) * currentPlaybackSpeed; 
        seekToTime(actualTime);
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
            seekToTime(0);//quick fix so that looping works with different speeds! will fix at some point just need to add more features!
        }
    }

    
    function clearLoopPoints() {
        isLooping = false;
    }

    slider.addEventListener('input', onSliderInput);
    slider.addEventListener('change', onSliderChange);
    setLoopButton.addEventListener('click', toggleLoopSetting);
    clearLoopButton.addEventListener('click', clearLoopPoints);
    
    document.getElementById('halfSpeed').addEventListener('click', () => setPlaybackSpeed(0.5));
    document.getElementById('normalSpeed').addEventListener('click', () => setPlaybackSpeed(1));
    document.getElementById('doubleSpeed').addEventListener('click', () => setPlaybackSpeed(2));

    window.updateMidiLength = updateMidiLength;
});



function checkLoopBoundary(time) {
    if (isLooping && time >= loopEndTime) {
        seekToTime(loopStartTime);
    }
}

function loadMidiFile(file, playSound, getInstrumentNumber, startTime = 0) {
    stopCurrentPlayback();

    console.log(`loadMidiFile: startTime=${startTime}`);

    currentFile = file;
    currentStartTime = startTime * currentPlaybackSpeed; 
    const reader = new FileReader();

    reader.onload = function(e) {
        const midi = new Midi(e.target.result);
        updateMidiLength(Math.floor(midi.duration / currentPlaybackSpeed)); 

        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                const noteStartTime = note.time / currentPlaybackSpeed; 
                const noteEndTime = noteStartTime + (note.duration / currentPlaybackSpeed);

                if (noteEndTime > currentStartTime) {
                    const delay = Math.max(noteStartTime - currentStartTime, 0) * 1000;
                    const duration = (noteEndTime - Math.max(currentStartTime, noteStartTime)) * 1000;

                    const timeout = setTimeout(() => {
                        const instrumentNumber = getInstrumentNumber();
                        playSound(note.name, instrumentNumber);

                        updateSliderPosition(noteStartTime * currentPlaybackSpeed);

                        setTimeout(() => {
                            resetHighlightedObjects(noteToObjectMap[note.name]);
                        }, duration); 
                    }, delay);

                    timeouts.push(timeout); 

                    console.log(`Scheduled note: name=${note.name}, startTime=${noteStartTime}, endTime=${noteEndTime}, delay=${delay}, duration=${duration}`);
                }
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

function stopCurrentPlayback() {

    console.log('Stopping current playback');


    timeouts.forEach(timeout => clearTimeout(timeout));
    timeouts = [];

    resetSliderAndStartTime();
}

function updateSliderPosition(time) {
    const slider = document.getElementById('midiSlider');
    const sliderValueDisplay = document.getElementById('sliderValue');
    const adjustedTime = Math.floor(time / currentPlaybackSpeed); 
    slider.value = adjustedTime;
    sliderValueDisplay.textContent = adjustedTime + 's / ' + slider.max + 's';
    console.log(`updateSliderPosition: time=${time}, adjustedTime=${adjustedTime}, playbackSpeed=${currentPlaybackSpeed}`);

    checkLoopBoundary(adjustedTime); 
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
    const actualTime = newTime * currentPlaybackSpeed; 

    console.log(`seekToTime: newTime=${newTime}, actualTime=${actualTime}, playbackSpeed=${currentPlaybackSpeed}`);


    stopCurrentPlayback();
    loadMidiFile(currentFile, playSound, getInstrumentNumber, actualTime);
    updateSliderPosition(newTime);
}

export { loadMidiFile };


//CURRENT BUG IS YOU CANT USE THE SEEK TO TIME WITH DIFFERENT TIME SPEEDS