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
            eventDispatcher.addEventListener(iam.eventhandling.customEvent("ui", "tabSelected", "objektList"), function(event) {
                updateObjects.call(this, event.data);
            }.bind(this));
            eventDispatcher.addEventListener(iam.eventhandling.customEvent("ui", "tabSelected", "objektListMitButtons"), function(event) {
                updateObjectsMitButton.call(this, event.data);
                inititaliseButtons();
            }.bind(this));
		};
	
    	function inititaliseButtons() {
            alert("ICH MUSS KOTZEN!!!#1");
    	    
            var objektButtons = document.querySelectorAll('.idButtons');
            for (var i = 0; i < objektButtons.length; i++) {
                //objektButtons[i].addEventListener("click", kacken(), false);
                objektButtons[i].onclick = function() {
                    returnID(this.id);
                };
            }
    	}
    	
    	function returnID(id) {
    	    alert("ICH MUSS KOTZEN!!!#2" + id);
    	    console.log("ICH MUSS KOTZEN!!!#2" + id);
            eventDispatcher.notifyListeners(iam.eventhandling.customEvent("ui", "objektSelected", "", id));
    	}
    
        function updateObjects(objektList) {
            console.log("updateEditView " + JSON.stringify(objektList));
            crudops.readAllObjects(function(objektList) {
                updateObjectlist(objektList);
            });
        }
        
        function updateObjectsMitButton(objektList) {
            var mitButton = true;
            console.log("updateEditView " + JSON.stringify(objektList));
            crudops.readAllObjects(function(objektList) {
                updateObjectlist(objektList, mitButton);
            });
        }
    
        function updateObjectlist(objektList, mitButton) {
            //alert("Objekte in der Objektlist: " + JSON.stringify(objektList));
            
            if (objektList) {
                var scrollview = document.querySelector('.scrollview');
                while (scrollview.firstChild) {
                    scrollview.removeChild(scrollview.firstChild);
                }
                var table = document.createElement("table");
                scrollview.appendChild(table);
                
                for (var i=0; i<objektList.length; i++) {
                    var row = table.insertRow(i);
                    row.insertCell(0).innerHTML = objektList[i].title;
                    row.insertCell(1).innerHTML = objektList[i].description;
                    row.insertCell(2).innerHTML = "<img src=\"" + objektList[i].src + "\" width=30px >";
                    if (mitButton) {
                        row.insertCell(3).innerHTML = 
                            "<button type=\"button\" class=\"idButtons\" id=\"" + objektList[i]._id + "\">X</button>";
                    }
                }
                
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
