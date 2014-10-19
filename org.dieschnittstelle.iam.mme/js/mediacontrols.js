var media = null;
var playel = null;
var soundel = null;
var durationel = null;
var positionel = null;

var initialised = false;

var browser_track_support = 'track' in document.createElement('track');

// this is for checking whether the browser natively supports the track element required for subtitles
console.log("browser track support: " + browser_track_support + "/" + document.createElement("track"));

function initialiseView() {
    if (!initialised) {
        // initialise the element variables
        media = document.getElementById("mediaelement");
        playel = document.getElementById("play");
        soundel = document.getElementById("sound");
        durationel = document.getElementById("duration");
        positionel = document.getElementById("position");

        // then set the listeners
        media.addEventListener("ended", function(event) {
            mediaEnded(media);
        });
        media.addEventListener("timeupdate", function() {
            updateTimer(media);
        });
        media.addEventListener("canplay", function(event) {
            mediaLoaded(media);
        });
        playel.onclick = function(event) {
            togglePlay(playel);
        }
        soundel.onclick = function(event) {
            toggleSound(soundel);
        }
        initialised = true;
    }
}

// control play vs. pause
function togglePlay(element) {
    console.log("togglePlay(): " + media.paused + "/" + media.ended);

    // if we have a video, we can control the playback speed
    if (media.tagName == "VIDEO") {
        media.playbackRate = 1;
    }

    if (media.paused) {
        if (media.ended) {
            media.currentTime = 0;
            // this seems to be necessary for chrome, see http://stackoverflow.com/questions/7853594/html5-video-pause-and-rewind
            media.load();
        }
        media.play();
        element.value = "pause";
    } else {
        media.pause();
        element.value = "continue";
    }
}

// control sound vs. mute
function toggleSound(element) {

    if (media.muted) {
        media.muted = false;
        element.value = "mute";
    } else {
        media.muted = true;
        element.value = "sound";
    }
}

function mediaLoaded(media) {
    console.log("mediaLoaded()");
    if (!initialised) {
        initialiseView();
    }
    console.log("media is: " + media);
    // note that on firefox media.duration is only available if content-length and content-range is set by the server, see: http://stackoverflow.com/questions/6887867/html5-audio-video-tag-duration-on-firefox
    console.log("media.duration is: " + media.duration);
    durationel.innerHTML = asTime(media.duration);
    media.volume = 0.15;
}

function mediaEnded(media) {
    console.log("mediaEnded()");
    playel.value = "repeat";
}

function updateTimer(media) {
    positionel.innerHTML = asTime(media.currentTime);
    if (positionel.innerHTML == durationel.innerHTML) {
        mediaEnded(media);
    }
}

// utility: display the duration of a media content
function asTime(t) {
    t = Math.round(t);
    var s = t % 60;
    var m = Math.round(t / 60);

    return two(m) + ':' + two(s);
}

// utility for integer formating with leading zeros
function two(s) {
    s += "";
    if (s.length < 2)
        s = "0" + s;
    return s;
}
