/**********************************************************************************************
 *           control the form for displaying and edting object properties (FRM2+MFM2)
 **********************************************************************************************/
// extend the iam module
var iam = ( function(iammodule) {

    console.log("loading ObjektFormViewContoller as submodule controller.objektform of: " + iammodule);

    // create the controller submodule if it doesn't exist yet
    if (!iammodule.controller) {
        iammodule.controller = {};
    }

    function ObjektFormViewController(_topicid, _eventDispatcher, _crudops) {

        var topicid = _topicid;
        var crudops = _crudops;
        var eventDispatcher = _eventDispatcher;
        var topicviewObj;

        var objektForm = document.forms["form_objekt"];
        var objektFormSubmit = objektForm.submit;
        var objektFormInputUpload = objektForm.upload;
        var objektFormInputUrl = objektForm.src;
        var objektFormInputList = objektForm.list;
        var deleteObjektButton = document.getElementById("deleteObjektButton");

        var contentModeUploadButton = document.getElementById("objektContentModeUpload");
        var contentModeUrlButton = document.getElementById("objektContentModeUrl");
        var contentModeListButton = document.getElementById("objektContentModeList");

        var objekt = null;

        this.initialiseObjektForm = function() {
            console.log("initialiseObjektForm()");
            //alert("initialiseObjektForm()...objektFormSubmit: " + objektFormSubmit);

            //contentModeSelectorUpload = objektForm.querySelector("#objektContentMode_upload");
            //contentModeSelectorUrl = objektForm.querySelector("#objektContentMode_url");

            eventDispatcher.addEventListener(iam.eventhandling.customEvent("ui", "tabSelected", "object"), function(event) {
                console.log("HIER SAMMA!! - this : " + JSON.stringify(this) + " - event.data: " + JSON.stringify(event));
                updateObjektForm.call(this, objekt);
            }.bind(this));

            eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "created|read", "object"), function(event) {
                console.log("HIER SAMMA NUMOL!! - this : " + JSON.stringify(this) + " - event.data: " + JSON.stringify(event));
                updateObjektForm.call(this, event.data);
                objekt = event.data;
            }.bind(this));

            objektForm.addEventListener("submit", function(event) {
                event.preventDefault();
                submitObjektForm();
             });
             
            contentModeUploadButton.onclick = toggleContentMode;
            contentModeUrlButton.onclick = toggleContentMode;
            contentModeListButton.onclick = toggleContentMode;

            // set an event listener on the title input element: "input" vs. "change": the latter will only be called on focus change!
            objektForm.title.addEventListener("input", function(event) {
                // check whether the target (i.e. the title element) is empty
                if (event.target.value.length == 0) {
                    deleteObjektButton.disabled = true;
                } else {
                    deleteObjektButton.disabled = true;
                    objektForm.submit.disabled = false;
                }
                if (topicviewObj.content_items[0] && topicviewObj.content_items[0].type == "objekt") {
                    deleteObjektButton.disabled = false;
                }
            }.bind(this));

            // listeners for the crud events
            eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "read|created|updated|deleted", "topicview"), function(event) {
                topicviewObj = event.data;
                console.log("ObjektFormViewController hat das topicviewObj: " + JSON.stringify(topicviewObj));
                if (topicviewObj.content_items[0]) {
                    updateObjektForm(topicviewObj.content_items[0]);
                } else {
                    updateObjektForm();
                }
            }.bind(this));
        };

        function toggleContentMode() {
            if ((this.event && this.event.target == contentModeUploadButton) || getSelectedContentMode() == "upload") {
                objektFormInputUpload.disabled = false;
                objektFormInputUrl.disabled = true;
                objektFormInputList.disabled = true;
            } else if ((this.event && this.event.target == contentModeListButton) || getSelectedContentMode() == "list") {
                objektFormInputUpload.disabled = true;
                objektFormInputUrl.disabled = true;
                objektFormInputList.disabled = false;
            } else {
                objektFormInputUpload.disabled = true;
                objektFormInputUrl.disabled = false;
                objektFormInputList.disabled = true;
            }
        }

        /*
         * this function can be called from an event listener when a crud operation has been performed on some object element
         */
        function updateObjektForm(objektElement) {
            if (objektElement) {
                console.log("updateObjektForm() hat Objekt gefunden: " + JSON.stringify(objektElement));
                objektForm.title.value = objektElement.title;
                objektForm.src.value = objektElement.src;
                objektForm.description.value = objektElement.description;
                objektFormSubmit.value = "Aktualisieren";
                objektFormSubmit.disabled = true;
                deleteObjektButton.disabled = false;
            } else {
                console.log("updateObjektForm() hat kein Objekt gefunden");
                objektForm.title.value = "";
                objektForm.src.value = "";
                objektForm.description.value = "";
                objektFormSubmit.value = "Erzeugen";
                objektFormSubmit.disabled = true;
                deleteObjektButton.disabled = true;
            }
            //console.log("updateObjektForm - objektElement: " + JSON.stringify(objektElement));
            toggleContentMode();
        }

        function getSelectedContentMode() {
            return objektForm.querySelector("input[type='radio']:checked").value;
        }

        /*
         * this method can be used for implementing submission of object form content to the server
         */
        function submitObjektForm() {
            console.log("submitObjektForm()");

            if (getSelectedContentMode() == "upload") {
                alert("create multipart form!");
                var formdata = new FormData();
                formdata.append("title", objektForm.title.value);
                formdata.append("src", objektForm.upload.files[0]);
                formdata.append("description", objektForm.description.value);
                formdata.append("type", "objekt");
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState==4 && xhr.status == 200) {
                        alert("got response from server: " + xhr.responseText);
                        var objektData = JSON.parse(xhr.responseText);
                        crudops.createObject(objektData, function(created) {
                            alert("created objekt element: " + JSON.stringify(created));
                            eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "object", created));
                        });
                    }
                };
                xhr.open("POST", "http2mdb/objects");
                xhr.send(formdata);
            } else {
                crudops.createObject({
                    title : objektForm.title.value,
                    src : objektForm.src.value,
                    type : "objekt",
                    description : objektForm.description.value
                }, function(created) {
                    //alert("created objekt: " + JSON.stringify(created));
                    eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "object", created));
                });
            }
            return false;
        }

        // set a click event listener on the delete button
        document.getElementById("deleteObjektButton").addEventListener("click", function(event) {
            if (confirm("Möchten Sie das Objekt für \"" + topicviewObj.title + "\" wirklich löschen?")) {
                console.log("objektformVC - topicviewObj: " + JSON.stringify(topicviewObj));
                crudops.deleteObject(topicviewObj, function(deleted) {
                    if (deleted) {
                        eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "deleted", "object"));
                    }
                }.bind(this));
            }
        }.bind(this));

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
