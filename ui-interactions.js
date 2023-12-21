document.addEventListener("DOMContentLoaded", function() {
    const midiControlToggle = document.getElementById("Midi-Control-Toggle");
    const selectionDiv = document.querySelector(".Selection");
    const midiControlDiv = document.querySelector(".Midi-Control");
    const sizeControlCenterDiv = document.querySelector(".Size-Control-Center"); 
    const exitIcon = document.getElementById("exit-icon");
    
    midiControlToggle.addEventListener("click", function() {
        selectionDiv.style.display = "none";
        midiControlDiv.style.display = "flex";
        sizeControlCenterDiv.style.display = "flex";
    });

    exitIcon.addEventListener("click", function() {
        selectionDiv.style.display = "flex"; 
        midiControlDiv.style.display = "none";
        sizeControlCenterDiv.style.display = "none"; 
    });
});
