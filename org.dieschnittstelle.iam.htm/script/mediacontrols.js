var paused = false;
var ended = true;

var media = null;

function initialiseMediaElement(elementname) {
	media = document.querySelector(elementname);
}

// control play vs. pause
function togglePlay(element) {

	// if we have a video, we can control the playback speed
	if (media.tagName == "VIDEO") {
		media.playbackRate = 1;	
	}

	if (media.paused || paused) {
		if (media.ended || ended) {
			media.currentTime = 0;
			ended = false;
		}
		media.play();
		element.value = "pause";
		paused = false;
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
	var duration = document.querySelector("#duration");
	console.log("media is: " + media);
	// note that on firefox media.duration is only available if content-length and content-range is set by the server, see: http://stackoverflow.com/questions/6887867/html5-audio-video-tag-duration-on-firefox
	// for the aptana web server this will not be the case!
	console.log("media.duration is: " + media.duration);
	duration.innerHTML = asTime(media.duration);
}

function mediaEnded(media) {
	var togglePlay = document.querySelector("#play");
	togglePlay.value = "repeat";
	ended = true;
	paused = true;
}

function updateTimer(media) {
	var position = document.querySelector("#position");
	position.innerHTML = asTime(media.currentTime);
	var duration = document.querySelector("#duration");
	if (position.innerHTML == duration.innerHTML) {
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
