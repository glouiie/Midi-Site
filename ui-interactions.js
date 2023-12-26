document.addEventListener("DOMContentLoaded", function() {
    const midiControlToggle = document.getElementById("Midi-Control-Toggle");
    const effectsControlToggle = document.getElementById("Effects-Control-Toggle");
    const selectionDiv = document.querySelector(".Selection");
    const midiControlDiv = document.querySelector(".Midi-Control");
    const effectsControlDiv = document.querySelector(".Effects-Control"); 
    const sizeControlCenterDiv = document.querySelector(".Size-Control-Center"); 
    const exitIconMidi = document.getElementById("exit-icon-midi");
    const exitIconEffects = document.getElementById("exit-icon-effects");
    
    midiControlToggle.addEventListener("click", function() {
        selectionDiv.style.display = "none";
        midiControlDiv.style.display = "flex";
        effectsControlDiv.style.display = "none"; 
        sizeControlCenterDiv.style.display = "flex";

        effectsControlDiv.style.display = "none"; 



    });

    effectsControlToggle.addEventListener("click", function() {
        selectionDiv.style.display = "none";
        effectsControlDiv.style.display = "flex"; 
        midiControlDiv.style.display = "none"; 
        sizeControlCenterDiv.style.display = "none"; 
    });

    exitIconMidi.addEventListener("click", function() {
        selectionDiv.style.display = "flex"; 
        midiControlDiv.style.display = "none";
        effectsControlDiv.style.display = "none"; 
        sizeControlCenterDiv.style.display = "none"; 
    });

    exitIconEffects.addEventListener("click", function() {
        selectionDiv.style.display = "flex"; 
        midiControlDiv.style.display = "none";
        effectsControlDiv.style.display = "none"; 
        sizeControlCenterDiv.style.display = "none"; 
    });
});
