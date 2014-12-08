/**********************************************************************************************
 *           control the form for displaying and edting object properties (FRM2+MFM2)
 **********************************************************************************************/
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading ObjektFormViewContoller as submodule controller.objektform of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	function ObjektFormViewController(_topicid, _eventDispatcher, _crudops) {

		var topicid = _topicid;
		var crudops = _crudops;
		var eventDispatcher = _eventDispatcher;
		
		var objektForm = document.forms["form_objekt"];
		var objektFormSubmit = objektForm.submit;
				
		this.initialiseObjektForm = function() {
			console.log("initialiseObjektForm()");
			alert("initialiseObjektForm()");
			alert("objektFormSubmit: " + objektFormSubmit);
			
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud","readcreated","object",function(event){
				updateObjektForm(event.data);
			}));
			
			objektForm.onsubmit = submitObjektForm;
		};
		
		/*
		 * this function can be called from an event listener when a crud operation has been performed on some object element
		 */
		function updateObjektForm(objektElement) {
			console.log("updateObjektForm()");
			objektForm.title.value = objektElement.title;
			objektForm.src.value = objektElement.src;	
		}


		/*
		 * this method can be used for implementing submission of object form content to the server
		 */
		function submitObjektForm() {
			console.log("submitObjektForm()");
			crudops.createObject({title: objektForm.title.value, src: objektForm.src.value}, function(created){
				//alert("created objekt: " + JSON.stringify(created));
				eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "object", readobj));
			});
			
			return false; 
		}

	}

	function newInstance(topicid, eventDispatcher, crudops) {
		// we combine instance creation with calling the initialise function
		var instance = new ObjektFormViewController(topicid, eventDispatcher, crudops);
		instance.initialiseObjektForm();
		
		return instance;
	}

	// export the module
	iammodule.controller.objektform = {
		newInstance : newInstance
	};

	return iammodule;

}(iam || {}));
