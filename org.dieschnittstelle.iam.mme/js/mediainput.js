/**
 * @author Jörn Kreutel
 *
 * this code has been developed on the basis of the documentation/tutorial in https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia
 */
navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

if (!navigator.getMedia) {
    alert("media capture is not supported by your browser!");
} else {
    console.log("media capture is supported.");
}

var width = 320;
var height = 240;

var canvasel = null;
var videoel = null;
var audioel = null;
var img1el = null;
var img2el = null;

var uriel = null;
var metadatael = null;
var savedmediauriel = null;

var activerecorder = null;

function initialise() {
    console.log("initialise()");
    canvasel = document.getElementById("canvas");
    videoel = document.getElementById("video");
    audioel = document.getElementById("audio");
    img1el = document.getElementById("img1");
    img2el = document.getElementById("img2");
    uriel = document.getElementById("mediauri");
    metadatael = document.getElementById("mediametadata");
    savedmediauriel = document.getElementById("savedmediauri");

    // check whether we have stored data
    var lastStoredImg = localStorage.getItem("lastStoredImg");
    if (lastStoredImg) {
        img1el.src = lastStoredImg;
        img2el.src = lastStoredImg;
    } else {
        console.log("no previously stored imgdata");
    }

    console.log("MediaRecorder: " + navigator.MediaRecorder);
    
    // set fix dimensions on the video element
    videoel.height = height;
    videoel.width = width;
}

function captureAudio() {
    console.log("captureAudio()");
    captureAndPlaybackMedia(true, false);
}

function captureVideo() {
    console.log("captureVideo()");
    captureAndPlaybackMedia(true, true);
}

/* capture and play the media (i.e. create a display in the case of video) */
function captureAndPlaybackMedia(doaudio, dovideo) {
    console.log("captureAndPlaybackMedia()");

    navigator.getMedia(

    // constraints
    {
        video : dovideo,
        audio : doaudio
    },

    // successCallback
    function(localMediaStream) {
        console.log("got media stream!");

        uriel.innerHTML = "";
        metadatael.innerHTML = "";
        savedmediauriel.innerHTML = "";

        if (dovideo) {
            activerecorder = videoel;
            mediasrc = window.URL.createObjectURL(localMediaStream);
            videoel.src = mediasrc;
            videoel.onloadedmetadata = function(e) {
                console.log("onloadedmetadata(): " + e);
                metadatael.appendChild(document.createTextNode(JSON.stringify(e)));
            };
        } else {
            activerecorder = audioel;
            mediasrc = window.URL.createObjectURL(localMediaStream);
            audioel.src = mediasrc;
            audioel.onloadedmetadata = function(e) {
                console.log("onloadedmetadata(): " + e);
                metadatael.appendChild(document.createTextNode(JSON.stringify(e)));
            };
        }

        if (mediasrc) {
            uriel.appendChild(document.createTextNode(mediasrc));
        }

    },

    // errorCallback
    function(err) {
        console.log("The following error occured: " + err);
        alert("got error during media capture: " + err);
    });

}


/* take a picture */
function storeMedia() {
    console.log("storeMedia()")
    if ( activerecorder = videoel) {
        console.log("storing media from video...");
        canvasel.width = videoel.width;
        canvasel.height = videoel.height;
        console.log("about to draw video on canvas with dimensions: " + canvasel.width + "/" + canvasel.height);
        canvasel.getContext('2d').drawImage(videoel, 0, 0, canvasel.width, canvasel.height);
        var data = canvasel.toDataURL('image/png');        
        img1el.setAttribute('src', data);
        img2el.setAttribute('src', data);
        // store the lastImg locally
        localStorage.setItem("lastStoredImg", data);
    } else {
        console.log("cannot store audio!");
    }
}

