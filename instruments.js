import * as Tone from 'tone';

let TextArray = [];
let pianoSounds = [];

class Instrument {
    constructor(name, samples) {
        this.name = name;
        this.sampler = new Tone.Sampler({
            urls: samples,
            release: 1,
            volume: -12
        }).toDestination();
       
        TextArray.push(this.name);
        pianoSounds.push(this)

    }
    playSound(note) {
        if (this.sampler) {
            this.sampler.triggerAttackRelease(note, "4n");
        }
    }
}

const GrandPiano = new Instrument("Grand Piano", {
    C3: "keyboard sounds/grand piano/Piano C3.mp3"
});

const Rhodes = new Instrument("Rhodes", {
    C3: "keyboard sounds/rhodes/rhodes.mp3"
});


const CatPiano = new Instrument("Cat Piano", {
    E3: "keyboard sounds/cat piano/meow.wav"
});

export { pianoSounds, TextArray };
