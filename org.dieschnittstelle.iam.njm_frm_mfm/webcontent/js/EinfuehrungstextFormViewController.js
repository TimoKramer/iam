/**********************************************************************************************
 *             new functionality for MFM: Form for creating einfuehrungstext
 **********************************************************************************************/
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading EinfuehrungstextFormViewContoller as submodule controller.einfuehrungstextform of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	function EinfuehrungstextFormViewController(_topicid, _eventDispatcher, _crudops) {

		var inputSrc;
		var inputTxt;
		var outputValidationMessages;
		var inputContentModeFirst;

		var eventDispatcher = _eventDispatcher;

		this.initialiseEinfuehrungstextForm = function() {

			// initialise the ui elements
			inputSrc = document.querySelector("#form_einfuehrungstext input[name='src']");
			inputTxt = document.querySelector("textarea[name='txt']");
			inputContentModeFirst = document.querySelector("input[name='contentMode']");
			outputValidationMessages = document.getElementsByClassName("validationMessages")[0];

			console.log("initialised ui elements: " + inputSrc + ", " + inputTxt);

			// we declare a listener function that we add to the three radio buttons
			var radioOnClickListener = function(event) {
				console.log("got onclick on radio button: " + event.target);
				// as soon as we get a click, we remove any validationMessage
				inputContentModeFirst.setCustomValidity("");
				outputValidationMessages.innerHTML = "";

				if (event.target.id == "contentMode_txt") {
				    console.log("contentMode_txt gewählt...inputsrc.disabled");
					inputSrc.disabled = true;
					inputTxt.disabled = false;
				} else {
				    console.log("contentMode_txt gewählt...inputsrc.enabled");
					inputSrc.disabled = false;
					inputTxt.disabled = true;
				}
			};

			// we add the listener to the radio buttons
			var radioButtons = document.querySelectorAll("input[name='contentMode']");
			console.log("found radio buttons: " + radioButtons);
			for (var i = 0; i < radioButtons.length; i++) {
				radioButtons[i].onclick = radioOnClickListener;
			}

			// we also declare listeners on the input fields that reset the vaidation messages in case an input occurs
			inputTxt.oninput = function(event) {
				outputValidationMessages.innerHTML = "";
			};
			inputSrc.onclick = function(event) {
				outputValidationMessages.innerHTML = "";
			};
			// we declare a listener that catches the invalid event and that is added to each input element
			var inputOnInvalidListener = function(event) {
				console.log("invalid: " + event.currentTarget + ": " + event.currentTarget.validity.valueMissing + ", " + event.currentTarget.validationMessage);
				// we add the validation message to the output element
				outputValidationMessages.innerHTML = event.currentTarget.validationMessage;
				// avoid setting the standard validation message bubble - this does not affect the styling!
				event.preventDefault();
			};
			// add the listener to some input elements
			inputSrc.oninvalid = inputOnInvalidListener;
			inputTxt.oninvalid = inputOnInvalidListener;
			inputContentModeFirst.oninvalid = inputOnInvalidListener;

			// set a submit function on the einfuehrungstext form that also deals with validation
			document.forms["form_einfuehrungstext"].onsubmit = function(event) {
				console.log("got submit on form_einfuehrungstext. Validate...");

				// check whether we have a selected radio button
				var checkedButton = document.querySelector("input[name='contentMode']:checked");
				if (!checkedButton) {
					console.log("no button selected!");
					// we set the custom validity on the
					inputContentModeFirst.setCustomValidity("Eine Eingabeart muss ausgewählt werden!");
					// this triggers the invalid event!
					inputContentModeFirst.checkValidity();
					return false;
				} else {
					return submitEinfuehrungstextForm();
				}
			};
		};

		/*
		 * this is a demo method that shows different ways of form usage - it is fully functional only for case the user selected the "fileupload" option. Here, the server's response will be sent to the page's iframe and trigger the onMultipartResponse method!
		 */
		function submitEinfuehrungstextForm() {
			console.log("submitEinfuehrungstextForm()");

			// determine field names and values
			var fieldsAndValues = "";
			var form = document.forms["form_einfuehrungstext"];

			// depending on whether a file shall be uploaded or not, we trigger or block action execution on the form. If no file upload will be used, we could simply run an xhr

			// we check whether fileupload has been selected
			var checkedButton = document.querySelector("input[name='contentMode']:checked");
			console.log("checked button is: " + checkedButton);
			// this is the fully functional case
			if (checkedButton && checkedButton.value == "fileupload") {
				console.log("fileupload is selected. we will trigger the form action...");
				return true;
			}
			// this shows how the FormData object available in HTML5 can be used
			// see for mozilla documentation: http://mdn.beonex.com/en/DOM/XMLHttpRequest/FormData/Using_FormData_Objects.html
			// see the standard specs: http://xhr.spec.whatwg.org/
			else if (checkedButton && checkedButton.value == "fileupload_formdata") {
				console.log("fileupload via formdata is selected. we will trigger the form action internally...");

				var formdata = new FormData();
				formdata.append("src", form.src.files[0]);
				formdata.append("type", form.type.value);
				formdata.append("render_container", form.render_container.value);

				console.log("created formdata: " + formdata);

				// we cannot use the xhr function because it expects a json object, so let's implement a minimal usage of XMLHttpRequest
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
						if (xhr.status == 200) {
							alert("formdata has been processed successfully: Got: " + xhr.responseText);
						} else {
							alert("got an error on sending formdata! Status is: " + xhr.status);
						}
					}
				};
				xhr.open("POST", "http2mdb/content/formdata");
				xhr.send(formdata);

				return false;
			}
			// this is the option where no fileupload is required
			else {
				console.log("fileupload is not selected. Create element locally...");
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "einfuehrungstext", {
					type : "einfuehrungstext",
					render_container : "left",
					txt : inputTxt.value
				}));
				return false;
			}
		}

	}

	function newInstance(_topicid, _eventDispatcher, _crudops) {
		return new EinfuehrungstextFormViewController(_topicid, _eventDispatcher, _crudops);
	}

	// export the module
	iammodule.controller.einfuehrungstextform = {
		newInstance : newInstance
	};

	return iammodule;

})(iam || {});
