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
		
		this.initialiseObjektForm = function() {
			console.log("initialiseObjektForm()");
			//alert("initialiseObjektForm()");
	
		};
		
		/*
		 * this function can be called from an event listener when a crud operation has been performed on some object element
		 */
		function updateObjektForm(objektElement) {
			console.log("updateObjektForm()");	
		}


		/*
		 * this method can be used for implementing submission of object form content to the server
		 */
		function submitObjektForm() {
			console.log("submitObjektForm()");

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
