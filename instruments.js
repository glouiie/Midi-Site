import * as Tone from 'tone';

let TextArray = [];
let pianoSounds = [];

let reverb = new Tone.Reverb({
    decay: 1.5,
    preDelay: 0.01
}).toDestination();

let autoWah = new Tone.AutoWah(50, 6, -30).toDestination();

class Instrument {
    constructor(name, samples) {
        this.name = name;
        this.sampler = new Tone.Sampler({
            urls: samples,
            release: 1,
            volume: -12
        }).toDestination(); 

        TextArray.push(this.name);
        pianoSounds.push(this);
    }

    playSound(note) {
        if (this.sampler) {
            this.sampler.triggerAttackRelease(note, "4n");
        }
    }

    updateEffects() {
        this.sampler.disconnect();

        const effectsChain = [];
        if (document.getElementById('reverbEnabled') && document.getElementById('reverbEnabled').checked) effectsChain.push(reverb);
        if (document.getElementById('autoWahEnabled') && document.getElementById('autoWahEnabled').checked) effectsChain.push(autoWah); //could possibily rewrite this better but fine for now

        if (effectsChain.length === 0) {
            this.sampler.toDestination();
        } else {
            this.sampler.chain(...effectsChain, Tone.Destination); //spread operator to keep it modular so i can add more effects later if need be
        }
    }
}

//adding instruments
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




// DOM EFFECTS!
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reverbDecay').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        reverb.decay = value;
        document.getElementById('reverbDecayValue').textContent = value;
    });

    document.getElementById('autoWahBaseFrequency').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        autoWah.baseFrequency = value;
        document.getElementById('autoWahBaseFrequencyValue').textContent = value;
    });



    const effectCheckboxes = ['reverbEnabled', 'autoWahEnabled'];
    effectCheckboxes.forEach(effectCheckboxId => {
        document.getElementById(effectCheckboxId).addEventListener('change', () => {
            pianoSounds.forEach(instrument => {
                instrument.updateEffects(); 
            });
        });
    });
});
