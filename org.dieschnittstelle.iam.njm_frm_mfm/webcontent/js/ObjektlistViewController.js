/**********************************************************************************************
 *             control the objectlist view (FRM3+MFM3)
 **********************************************************************************************/
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading ObjektlistViewContoller as submodule controller.objektlist of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	function ObjektlistViewController(_topicid, _eventDispatcher, _crudops) {

		var topicid = _topicid;
		var crudops = _crudops;
		var eventDispatcher = _eventDispatcher;
		
		this.initialiseObjektlist = function() {
			console.log("initialiseObjektlist()");
			//alert("initialiseObjektlist()");			
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created|updated|deleted", "object"), function(event){
				updateEditView(event);
			});
		};
		
		eventDispatcher.addEventListener(iam.eventhandling.customEvent("ui", "tabSelected", "allObjects"), function(event) {
            console.log("DO SAMMA!!");
            updateEditView.call(this, event.data);
        }.bind(this));
	}

    function updateEditView(hasObjekt) {
        console.log("updateEditView " + JSON.stringify(hasObjekt));
    }

	function newInstance(topicid, eventDispatcher, crudops) {
		// we combine instance creation with calling the initialise function
		var instance = new ObjektlistViewController(topicid, eventDispatcher, crudops);
		instance.initialiseObjektlist();
		
		return instance;
	}

	// export the module
	iammodule.controller.objektlist = {
		newInstance : newInstance
	};

	return iammodule;

}(iam || {}));
