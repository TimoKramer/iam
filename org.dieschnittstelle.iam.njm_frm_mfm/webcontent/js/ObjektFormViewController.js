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

			var objektForm = document.forms["form_objekt"];
			var objektFormSubmit = objektForm.submit;
			var objektFormInputUpload = objektForm.upload;
			var objektFormInputUrl = objektForm.src;

			var contentModeUploadButton = document.getElementById("objektContentModeUpload");
			var contentModeUrlButton = doucment.getElementById("objektContentModeUrl");

			this.initialiseObjektForm = function() {
				console.log("initialiseObjektForm()");
				alert("initialiseObjektForm()...objektFormSubmit: " + objektFormSubmit);

				//contentModeSelectorUpload = objektForm.querySelector("#objektContentMode_upload");
				//contentModeSelectorUrl = objektForm.querySelector("#objektContentMode_url");

				eventDispatcher.addEventListener(iam.eventhandling.customEvent("crud", "created|read", "object"), function(event) {
					//eventDispatcher.notifyListeners(iam.eventhandling.customEvent("ui", "tabCreated", "", "objekt"));
					//updateObjektForm.call(this, event.data);
					updateObjektForm.call(event.data);
				}.bind(this));

				objektForm.onsubmit = submitObjektForm;

				contentModeUploadButton.onclick = toggleContentMode;
				contentModeUrlButton.onclick = toggleContentMode;

				updateObjektForm();
			};

			function toggleContentMode() {
				if ((event && event.target == contentModeUploadButton) || getSelectedContentMode() == "upload") {
					objektFormInputUpload.disabled = false;
					objektFormInputUrl.disabled = true;
				} else {
					objektFormInputUpload.disabled = true;
					objektFormInputUrl.disabled = false;
				}
			}

			/*
			 * this function can be called from an event listener when a crud operation has been performed on some object element
			 */
			function updateObjektForm(objektElement) {
				if (objektElement) {
					console.log("updateObjektForm()");
					objektForm.title.value = objektElement.title;
					objektForm.src.value = objektElement.src;
					objektFormSubmit.value = "Aktualisieren";
					objektFormSubmit.disabled = true;
				} else {
					objektFormSubmit.value = "Erzeugen";
					objektFormSubmit.disabled = false;
				}

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
					formdata.append("title", objektForm.titile.value);
					formdata.append("src", objektForm.upload.files[0]);

					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function() {
						if (xhr.readystate == 4) {
							if (xhr.status == 200) {
								alert("got response from server: " + xhr.responseText);
								var objektData = JSON.parse(xhr.responseText);
								crudops.createObject(objektData, function(created){
									alert("created objekt element: " + JSON.stringify(created));
									eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "object", created));
								});
							}
						}
					};
					xhr.open("POST", "http2mdb/objects");
					xhr.send(formdata);
				} else {
					crudops.createObject({
						title : objektForm.title.value,
						src : objektForm.src.value
					}, function(created) {
						//alert("created objekt: " + JSON.stringify(created));
						eventDispatcher.notifyListeners(iam.eventhandling.customEvent("crud", "created", "object", created));
					});
				}
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
