/**
 * @author Jörn Kreutel
 *
 * this follows http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API and http://stiltsoft.com/blog/2013/05/google-chrome-how-to-use-the-web-speech-api/
 */

/*
 * the recogniser and the display elements
 */
var recogniser = null;

var recoresults = null;

var recoerror = null;

var recoinput = null;

var recocontrol = null;

var recocontrolabort = null;

var recomaxnbest = null;

var recocontinuous = null;

var recointerim = null;

var recolang = null;

/*
 * initialise the different functions that will be used for processing recognition results
 */
var onRecoStart = function() {
    console.log("onRecoStart()");
}
var onRecoEnd = function() {
    console.log("onRecoEnd()");
}
var onRecoResult = function(event) {
    console.log("onRecoResult(): " + JSON.stringify(event));
    //console.log("resultIndex is: " + event.resultIndex);
    //console.log("results.length is: " + event.results.length);
    //console.log("results are: " + event.results);

    // if we have a recoinput value the previous result was a final result, i.e. we are in a new round of recognition and clear the input area and the results list
    if (recoinput.value != "") {
        recoinput.value = "";
        recoresults.innerHTML = "";
    }

    //
    var li = document.createElement("li");
    recoresults.appendChild(li);

    var ul = document.createElement("ul");
    li.appendChild(ul);
    for (var i = event.resultIndex; i < event.results.length; i++) {

        // we create a new li element embedding the different results as an embedded list
        var currentli = document.createElement("li");
        ul.appendChild(currentli);

        // if we have a final result, we try to obtain the nbest list
        if (event.results[i].isFinal) {

            var currentol = document.createElement("ol");
            currentli.appendChild(currentol);

            for (var j = 0; j < event.results[i].length; j++) {
                var currentlili = document.createElement("li");
                currentol.appendChild(currentlili);
                var currenttext = event.results[i][j].transcript;
                currentlili.appendChild(document.createTextNode(currenttext + " (" + event.results[i][j].confidence + ")"));
            }

            // we set the first best as value in the textarea
            recoinput.value = event.results[i][0].transcript;
            // if we have a final event we abort here, unless we are continous
            if (!recogniser.continuous) {
                console.log("aborting recogniser on final event in non continuous mode...");
                recogniser.abort();
            }
        }
        // otherwise we just add the first best (there do not seem to be any nbest for intermediate results, anyway)
        else {
            currentli.appendChild(document.createTextNode(event.results[i][0].transcript + "(" + event.results[i][0].confidence + ")"));
        }
    }
}
var onRecoError = function(event) {
    console.log("onRecoError(): " + event);
    if (event.error == "aborted") {
        console.log("recognition aborted: " + JSON.stringify(event));
    } else {
        // we write the error into the recoinput
        recoinput.value = "ERROR: " + JSON.stringify(event);
    }
}
/*
 * initialise global variables
 */
function onPageLoaded() {
    // initialise the elements
    recoresults = document.getElementById("recoresults");
    recoerror = document.getElementById("recoerror");
    recoinput = document.getElementById("recoinput");
    recolang = document.getElementById("recolang");
    recomaxnbest = document.getElementById("recomaxnbest");
    recointerim = document.getElementById("recointerim");
    recocontinuous = document.getElementById("recocontinuous");
    recocontrol = document.getElementById("recocontrol");
    recocontrolabort = document.getElementById("recocontrolabort");

    console.log("initialised elements: " + recoresults + " / " + recoerror + " / " + recoinput + "/" + recolang + " / " + recocontrol);

    // initialise the recogniser
    if (!('webkitSpeechRecognition' in window)) {
        console.log("speech recognition is not available!");
        recocontrol.disabled = "disabled";
    } else {
        recogniser = new webkitSpeechRecognition();

        // log the default  state of the recogniser
        console.log("********************************");
        for (var field in recogniser) {
            console.log(field + "=" + recogniser[field]);
        }
        console.log("********************************");

        console.log("initialising recogniser: " + recogniser);

        recogniser.onstart = onRecoStart;
        recogniser.onresult = onRecoResult;
        recogniser.onerror = onRecoError;
        recogniser.onend = onRecoEnd;

    }
}

function abortReco() {
    console.log("abortReco()");
    recogniser.abort();
}

/*
 * start the recognition
 */
function startReco() {
    console.log("startReco()");
    recogniser.lang = recolang.value;

    // clear the existing results
    recoresults.innerHTML = "";
    recoinput.value = "";

    // we set the parameters
    recogniser.continuous = recocontinuous.checked;
    recogniser.interimResults = recointerim.checked;
    recogniser.maxAlternatives = recomaxnbest.value;
    recogniser.lang = recolang.value;
    console.log("parameters are: " + recogniser.continuous + "/" + recogniser.interimResults + "/" + recogniser.maxAlternatives + "/" + recogniser.lang);

    recocontrolabort.disabled = !recogniser.continuous;

    // and start it...
    recogniser.start();
}
