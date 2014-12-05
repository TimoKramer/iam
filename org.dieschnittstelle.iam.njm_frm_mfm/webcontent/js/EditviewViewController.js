/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading EditviewViewContoller as submodule controller.editview of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	// for (var mod in iammodule) {
	// console.log("found submodule: iam." + mod);
	// }

	function EditviewViewController(_topicid, _eventDispatcher, _crudOperations) {

		/*
		 * ui elements that are used at various places in the code;
		 */
		var tabsContainer = null;
		var inactiveTabsContainer = null;
		var newElementTab = null;
		var editview = null;

		/*
		 * the topicid
		 */
		var topicid = _topicid;

		/*
		 * the event dispatcher used for communication between the single view controllers of a composite view
		 */
		var eventDispatcher = _eventDispatcher;

		/*
		 * the implementation of the crud operations that we use
		 */
		var crudops = _crudOperations;

		this.initialiseView = function() {
			console.log("initialiseEditview()");

			// initialise the ui elements
			editview = document.getElementById("editview");
			tabsContainer = document.getElementsByClassName("tabsContainer")[0];
			inactiveTabsContainer = document.getElementsByClassName("inactiveTabsContainer")[0];
			newElementTab = document.getElementById("tab_newElement");

			// initialise the long press handling
			initialiseLongPressHandling.call(this);

			// initialise the form for adding elements
			initialiseAddElementForm();

			// in case a topicview is created we add the newElementTab to the tab bar
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created", "topicview"), function(event) {
				iam.uiutils.cutNpasteElement(newElementTab, tabsContainer);
			}.bind(this));
			// in case it is deleted, we remove the element again
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "deleted", "topicview"), function(event) {
				iam.uiutils.cutNpasteElement(newElementTab, inactiveTabsContainer);
				if (editview.classList.contains("overlay")) {
					editview.classList.toggle("overlay");
				}
			}.bind(this));

			// initialise the controller for the title form
			var titleformVC = iam.controller.titleform.newInstance(topicid, eventDispatcher, crudops);
			titleformVC.initialiseTitleForm();
			
			// for MFM: use some extended form example
			var einfuehrungstextformVC = iam.controller.einfuehrungstextform.newInstance(topicid, eventDispatcher, crudops);
			einfuehrungstextformVC.initialiseEinfuehrungstextForm();
		};
		
		/***************************************************************************************
		 *                               long press handling
		 ***************************************************************************************/
		function initialiseLongPressHandling() {
			// we enable longpress on the maincontent view which will result in opening the ediview
			iam.uiutils.enableLongpress(document.getElementById("mainview"), openEditview);

			// these two onclick handlers deal with keeping/closing the editview
			editview.onclick = function(event) {
				closeEditview(event);
			}.bind(this);

			tabsContainer.onclick = function(event) {
				keepEditview(event);
			};
			
			// we allow for another way to open the editview: click on the header 
			document.getElementsByTagName("header")[0].onclick = openEditview;
			// we block propagation of onclick in the zurück button (otherwise the above onclick handler will be invoked)
			document.getElementById("navigation_button").onclick = function(event) {
				event.stopPropagation();
			};
		}

		/***************************************************************************************
		 *                               adding new elements
		 ***************************************************************************************/
		function initialiseAddElementForm() {
			document.getElementById("form_addElement").onsubmit = function(event) {
				console.log("got submit on addElement form: " + event.target);

				// get the type of element that shall be created
				var elementType = event.target.elementType.value;
				console.log("selected element type is: " + elementType);
				showAddElementForm(elementType);
				return false;
			};
		}

		/*
		 * show the form that allows to select new elements
		 */
		function showAddElementForm(elementType) {
			console.log("showAddElementForm: " + elementType);
			switch (elementType) {
				case "einfuehrungstext":
					showTabForElementtype(elementType);
					selectTab(elementType);
					break;
				case "objekt":
					showTabForElementtype(elementType);
					showTabForElementtype("objektList");
					selectTab(elementType);
					break;
				default:
					iam.uiutils.showToast("Derzeit kein Editor verfügbar für Elementtyp " + elementType + "!");
			}
		}

		/***************************************************************************************
		 *                               UTILITY FUNCTIONS
		 ***************************************************************************************/

		/*
		 * add / remove / select tabs
		 */
		function showTabForElementtype(elementType) {
			iam.uiutils.cutNpasteElementById("tab_" + elementType, tabsContainer, "tab_newElement");
		}

		function hideTabForElementtype(elementType) {
			iam.uiutils.cutNpasteElementById("tab_" + elementType, inactiveTabsContainer);
		}

		function selectTab(elementType) {
			window.location.hash = "tab_" + elementType;
			// we dispatch a ui event that allows the controllers inside the tab to react on tab selection (e.g. by setting focus)
			eventDispatcher.notifyListeners(iam.eventhandling.customEvent("ui", "tabSelected", elementType));
		}

		/*
		 * methods for handling opening and closing the editview
		 */
		function openEditview() {
			console.log("openEditview()");
			editview.classList.toggle("overlay");
			// we will set the fragement identifier to the title tab to trigger the :target selector for foreground style assignment
			selectTab("title");
		}


		function closeEditview() {
			console.log("closeEditview()...");
			// reset the fragment identifier. This will keep the # in the browser location field
			selectTab("");
			editview.classList.toggle("overlay");
		}
		
		function keepEditview(event) {
			console.log("keepEditview()");
			event.stopPropagation();
		}

	}

	// a factory method
	function newInstance(topicid, eventDispatcher, crudOperations) {
		return new EditviewViewController(topicid, eventDispatcher, crudOperations);
	}


	iammodule.controller.editview = {
		newInstance : newInstance
	};

	// return the module
	return iammodule;

})(iam || {});
