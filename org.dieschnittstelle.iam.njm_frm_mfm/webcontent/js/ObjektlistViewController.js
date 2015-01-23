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

    var crudops = null;
    var topicid = null;
    var eventDispatcher = null;

	function ObjektlistViewController(_topicid, _eventDispatcher, _crudops) {

		topicid = _topicid;
		crudops = _crudops;
		eventDispatcher = _eventDispatcher;
				
		this.initialiseObjektlist = function() {
			console.log("initialiseObjektlist()");
            /*
            eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created", "topicview"), function(event){
                updateEditView(event);
            }.bind(this));
            
			eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created|updated|deleted", "object"), function(event){
				updateEditView(event);
			}.bind(this));
			*/
            eventDispatcher.addEventListener(iam.eventhandling.customEvent("ui", "tabSelected", "allObjects"), function(event) {
                console.log("DO SAMMA!! OHL OBJECTS");
                updateObjects.call(this, event.data);
            }.bind(this));
                        
		};
		
	}

    function updateObjects(allObjects) {
        console.log("updateEditView " + JSON.stringify(allObjects));
        crudops.readAllObjects(function(allObjects) {
            updateObjectlist(allObjects);
        });
    }
    
    function updateObjectlist(allObjects) {
        //alert("Objekte in der Objektlist: " + JSON.stringify(allObjects));
        
        if (allObjects) {
            var scrollview = document.querySelector('.scrollview');
            while (scrollview.firstChild) {
                scrollview.removeChild(scrollview.firstChild);
            }
            var table = document.createElement("table");
            scrollview.appendChild(table);
            
            for (var i=0; i<allObjects.length; i++) {
                var row = table.insertRow(i);
                row.insertCell(0).innerHTML = allObjects[i].title;
                row.insertCell(1).innerHTML = allObjects[i].description;
                row.insertCell(2).innerHTML = "<img src=\"" + allObjects[i].src + "\" width=30px >";
            }
            
        }
        
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
