import { resetHighlightedObjects,noteToObjectMap } from "./main";

class MidiHandler {
    constructor(instrumentNumber, playSoundFunction) {
        this.instrumentNumber = instrumentNumber;
        this.playSound = playSoundFunction; 
        this.lastHoveredKey = null;
        
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({ sysex: false }).then(this.onMIDISuccess.bind(this), this.onMIDIFailure);
        } else {
            console.warn("WebMIDI is not supported in this browser.");
        }
    }

    onMIDISuccess(midiAccess) {
        const inputs = Array.from(midiAccess.inputs.values());

        if (inputs.length === 0) {
            console.warn("No MIDI input devices detected.");
            return;
        }

        inputs.forEach(input => {
            input.onmidimessage = this.onMIDIMessage.bind(this);
        });
    }

    onMIDIFailure(error) {
        console.error("Failed to access MIDI devices:", error);
    }

    onMIDIMessage(event) {
        if (!event.data || event.data.length < 3) return;
    
        const command = event.data[0] & 0xf0;
        const noteNumber = event.data[1];
        const velocity = event.data[2];
    
        if (command === 0x90 && velocity > 0) {  // Note on
            const note = this.mapMIDIEventToNote(noteNumber);
            if (note) {
                this.playSound(note, this.instrumentNumber);
            }
        } else if (command === 0x90 && velocity === 0 || command === 0x80) {  // Note off
            const note = this.mapMIDIEventToNote(noteNumber);
            if (note && noteToObjectMap[note]) {
                resetHighlightedObjects(noteToObjectMap[note]);
            }
        }
    }
    

    mapMIDIEventToNote(noteNumber) {
        if (typeof noteNumber !== 'number') return null;
        return this.midiNumberToNoteName(noteNumber);
    }

    midiNumberToNoteName(midiNumber) {
        const noteNames = [
            'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
        ];

        const octave = Math.floor(midiNumber / 12) - 1;
        const noteIndex = midiNumber % 12;

        return noteNames[noteIndex] + octave;
    }
}

export default MidiHandler;
