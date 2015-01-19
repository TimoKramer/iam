/**
 * @author Jörn Kreutel
 */
/***************************************************************************************
 *                  setting a title and create a new topicview
 ***************************************************************************************/

// extend the iam module
var iam = (function(iammodule) {

	console.log("loading TitleFormViewContoller as submodule controller.topicview of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	// for (var mod in iammodule) {
	// console.log("found submodule: iam." + mod);
	// }

	function TitleFormViewController(_topicid, _eventDispatcher, _crudops) {

		var topicid = _topicid;
		var eventDispatcher = _eventDispatcher;
		var titleForm = null;
		var deleteTitleButton = null;
		var crudops = _crudops;
		var topicviewObj;

		titleForm = document.forms["form_title"];
		deleteTitleButton = document.getElementById("deleteTitleButton");

		this.initialiseTitleForm = function() {
			// set an event listener on the title form
			titleForm.onsubmit = function(event) {
				submitTitleForm.call(this);

				// we return false to prevent default form submission
				console.log("return false...");

				// this prevents the submit event to be further processed by actually submitting the form - needs to be called if event handler is added via addEventListener
				// event.preventDefault();

				return false;
			}.bind(this);

			// set an event listener on the title input element: "input" vs. "change": the latter will only be called on focus change!
			titleForm.title.addEventListener("input", function(event) {
				// check whether the target (i.e. the title element) is empty
				if (event.target.value.length == 0) {
					deleteTitleButton.disabled = true;
					titleForm.submit.disabled = true;
				} else {
					if (topicviewObj) {
						deleteTitleButton.disabled = false;
					}
					titleForm.submit.disabled = false;
				}
			}.bind(this));

			// set a click event listener on the delete button
			document.getElementById("deleteTitleButton").addEventListener("click", function(event) {
				if (confirm("Möchten Sie die Ansichtsbeschreibung für \"" + topicviewObj.title + "\" wirklich löschen?")) {
				    console.log("titleformVC - topicviewObj: " + JSON.stringify(topicviewObj));
					crudops.deleteTopicview(topicid, topicviewObj._id, function(deleted) {
						if (deleted) {
							eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "deleted", "topicview"));
						}
					}.bind(this));
				}
			}.bind(this));

			// set listeners for the crud events
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created|updated|deleted", "topicview"), function(event) {
				topicviewObj = event.data;
				console.log("TitleFormViewController hat das topicviewObj: " + JSON.stringify(topicviewObj));
				if (event.type == "created") {
					iam.uiutils.showToast("Ansichtsbeschreibung für \"" + event.data.title + "\" wurde erstellt!");
				} else if (event.type == "updated") {
					iam.uiutils.showToast("Titel \"" + event.data.title + "\" wurde aktualisiert!");
					// we currently only do partial updates of the title!
					topicviewObj.title = event.data.title;
				} else if (event.type == "deleted") {
					iam.uiutils.showToast("Die Ansichtsbeschreibung wurde gelöscht.");
					topicviewObj = null;					
				}
				updateTitleForm.call(this);
			}.bind(this));
			
			// react to selecting the tab for this element
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("ui", "tabSelected", "title"), function(event) {
				onFocus.call(this);
			}.bind(this));
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("ui", "tabSelected", "titel"), function(event) {
                onFocus.call(this);
            }.bind(this));

		};
		
		function onFocus() {
			// if we use longpress recognition for opening the editview we must explicitly request focus for the title element as the autofocus attribute does not seem to be considered
			titleForm.title.focus();
		}
		
		/*
		 * toggle the ui of the title form depending on whether we already have a title element or not
		 */
		function updateTitleForm() {

			// reset the title form
			titleForm.reset();

			// set the label to "Aktualisieren" if we already have a title element
			if (topicviewObj) {
				titleForm.submit.value = "Aktualisieren";
				// data binding: bind the value of the title to the title input field
				titleForm.title.value = topicviewObj.title;
				console.log("setting disabled status of delete button to false...");
				deleteTitleButton.disabled = false;
				titleForm.submit.disabled = true;
			} else {
				titleForm.submit.value = "Erstellen";
				deleteTitleButton.disabled = true;
				if (topicid) {
					titleForm.title.value = topicid.replace(/_/g, " ");
					titleForm.submit.disabled = false;
				} else {
					iam.uiutils.showToast("Something is wrong. No topicid exists!");
					titleForm.submit.disabled = true;
				}
			}

			console.log("updateTitleForm(): disabled status of submit button is: " + titleForm.submit.disabled);
			console.log("updateTitleForm(): disabled status of delete button is: " + deleteTitleButton.disabled);
		}
		
		/*
		 * handle submission of the title form
		 */
		function submitTitleForm() {

			// data binding: we read out the value of the title field from the form
			var title = titleForm.title.value;
			console.log("will submit title: " + title);

			// check whether we need to perform a create or update
			if (topicviewObj) {
				console.log("submitTitleForm(): update");
				crudops.updateTopicview(topicid, {
					title : title
				}, function(updated) {
					if (updated) {
						eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "updated", "topicview", updated));
					}
				}.bind(this));
			} else {
				console.log("submitTitleForm(): create");
				crudops.createTopicview(topicid, title, function(created) {
					eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "topicview", created));
				}.bind(this));
			}

			return false;
		}

	}

	function newInstance(_topicid, _eventDispatcher, _crudops) {
		return new TitleFormViewController(_topicid, _eventDispatcher, _crudops);
	}

	// export the module
	iammodule.controller.titleform = {
		newInstance : newInstance
	};

	return iammodule;

})(iam || {});
