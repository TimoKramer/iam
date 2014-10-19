/**
 * @author Jörn Kreutel
 */

/* a global variable */
var buttonsEnabled = true;

function onPageLoaded() {
    console.log("onPageLoaded()");

    // read out the button from the document
    var button = document.getElementById("disableButtonsButton");
    
    // we set the disableButtons function as event handler for the onclick event
    button.onclick = toggleButtons;

    console.log("onPageLoaded(): event handler set" /*+ : " + button.onclick*/);
}

function moveMaintermDemo() {
    console.log("moveMaintermDemo()")

    // access all term elements (querySelectorAll / getElementsByClassName)

    // then we access the element with the mainterm (querySelector / getElementById)

    // then we iterate over the terms and check which one is the mainterm - this can be done using identity
    var maintermpos = -1;

    // check whether we have found the mainterm
    if (maintermpos == -1) {
        alert("could not find the mainterm!");
    }
    /* if we have found the mainterm */
    else {
        // first remove the id attribute from the mainterm

        // then add the attribute to the next term in the list, unless we have reached the end, in which case we add it to the first element
    }

}

/*
 * move the mainterm id around the document
 */
function moveMainterm() {

    // we read out all elements whose class is term (querySelectorAll / getElementsByClassName)
    var terms = document.getElementsByClassName("term");
    console.log("got " + terms.length + " terms: " + terms);

    // then we access the element with the mainterm (querySelector / getElementById)
    var mainterm = document.querySelector("#mainterm");
    console.log("got mainterm: " + mainterm);

    // then we iterate over the terms and check which one is the mainterm - this can be done using identity
    var maintermpos = -1;
    for (var i = 0; i < terms.length; i++) {
        if (terms[i] === mainterm) {
            console.log("found mainterm at position: " + i);
            maintermpos = i;
            break;
        }
    }

    // check whether we have found the mainterm
    if (maintermpos == -1) {
        alert("could not find the mainterm!");
    }
    /* if we have found the mainterm */
    else {
        // first remove the id attribute from the mainterm
        terms[maintermpos].removeAttribute("id");

        // then add the attribute to the next term in the list, unless we have reached the end
        if (maintermpos == (terms.length - 1)) {
            terms[0].setAttribute("id", "mainterm");
        } else {
            terms[++maintermpos].id = "mainterm";
        }
    }

}

/*
 * toggle the borderstyle of an element, passed as the current event target
 */
function markSelected(event) {
    console.log("markSelected()");

    // log the event
    console.log("classes on currentTarget are: " + event.currentTarget.classList);

    // prevent the element from bubbling (stopPropagation())
    //event.stopPropagation();

    // check whether the element is the target
    if (event.target == event.currentTarget) {
        console.log("toggleBorderstyle() called on the target");
        // and add origin to the currentTarget to indicate that it is the origin of the event being processed
        event.currentTarget.classList.add("origin");
    } else {
        // if we are not the current target we remove any origin attributes
        console.log("toggleBorderstyle() called during bubbling");
    }

    // access the target's class list and toggle the selected value - this could also be done using the toggle function
    if (event.currentTarget.classList.contains("selected")) {
        event.currentTarget.classList.remove("selected");
    } else {
        event.currentTarget.classList.add("selected");
    }

    // we remove the origin from any other element that is not the target (note that in bubbling this is called for any element that uses this event handler)
    var origins = document.querySelectorAll(".origin");
    for (var i = 0; i < origins.length; i++) {
        if (origins[i] != event.target) {
            origins[i].classList.remove("origin");
        }
    }

}

function toggleButtons(event) {
    console.log("toggleButtons()");

    // access all button elements
    var buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        var currentButton = buttons[i];
        if (currentButton != event.target) {
            /* different ways to set the disabled attribute on the button */
            switch (i % 3) {
                case 0:
                    if (buttonsEnabled) {
                        currentButton.setAttribute("disabled", true);
                    } else {
                        // removing the attribute must be done using removeAttribute rather than the standard object attribute delete method!
                        currentButton.removeAttribute("disabled");
                    }
                    break;
                case 1:
                    if (buttonsEnabled) {
                        currentButton["disabled"] = "disabled";
                    } else {
                        currentButton.removeAttribute("disabled");
                    }
                    break;
                case 2:
                    if (buttonsEnabled) {
                        currentButton.disabled = true;
                    } else {
                        currentButton.removeAttribute("disabled");
                    }
                    break;
            }
        } else {
            // the assignment anticipates toogling the buttonsEnabled value in the subsequent step
            currentButton.textContent = ( buttonsEnabled ? "Enable Buttons" : "Disable Buttons");
        }
    }

    buttonsEnabled = !buttonsEnabled;
}

/*
 * fade the selected element, obscuring it more and more
 */
function fadeSelected() {
    console.log("fadeSelected()");

    // we use the element marked as origin
    var selectedOrigin = document.querySelector(".origin");

    if (selectedOrigin) {
        // we toggle the faded attribute
        selectedOrigin.classList.toggle("faded");
    } else {
        console.log("no origin selected for fading...");
    }
}

/* show a toast and use a listener for transitionend for fading out */
function showToast() {
   console.log("showToast(): using transitionend listener");
   var toast = document.querySelector(".toast");
   var currenttime = new Date();
   // see http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-with-format-hhmmss#answer-25279399
   toast.textContent =  currenttime.toISOString().substr(11, 5);
   toast.classList.toggle("active");   
   /* initiiere das Ausblenden des Toasts nach Abschluss der Transition */
   toast.addEventListener("transitionend", fadeoutToast);
}


/* trigger fading out the toast and remove the event listener  */
function fadeoutToast() {
   console.log("fadeoutToast()");
   var toast = document.querySelector(".toast");
   toast.classList.toggle("active");
   /*entferne fadeoutToast als Event Handler für transitionend */
   toast.removeEventListener("transitionend", fadeoutToast);
}

/*
 * show a toast, using the setTimeout functionality
 */
function showToastUsingTimeout() {
    console.log("showToast(): will use timeout for starting fadedout");

    // access the toast element
    var toast = document.querySelector(".toast");
    // set the current time on the toast
    var currenttime = new Date();
    toast.textContent = currenttime.getHours() + ":" + currenttime.getMinutes();
    toast.classList.toggle("active");
    setTimeout(function() {
        toast.classList.toggle("active");
    }, 3000);
}
