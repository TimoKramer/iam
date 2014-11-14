function onPageLoaded() {
    console.log("onPageLoaded()");
    fadeSelected();
}
    
function fadeSelected() {
    console.log("fadeSelected()");

    // we use the element marked as origin
    var blenden = document.querySelectorAll(".ausgeblendet");
    
	if (selectedOrigin) {
        // we toggle the faded attribute
        selectedOrigin.classList.toggle("eingeblendet");
    } else {
        console.log("no origin selected for fading...");
    }
}