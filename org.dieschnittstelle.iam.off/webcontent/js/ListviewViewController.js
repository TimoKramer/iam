/**
 * @author Jörn Kreutel
 */

function ListviewViewController() {

	// the list of items contained in the db
	var itemlistView = null;

	// a single list element that will be added to the itemlist
	var itemView = null;

	// the root of the view
	var viewRoot = null;
	
	var createItemButton = null;

	// the dialog that allows to edit / delete an item, including the ui elements used by the dialog
	var itemDialog = null;
	var itemDialogUpdateForm = null;
	var itemDialogUpdate = null;
	var itemDialogDelete = null;
	var itemDialogTitle = null;

	// this is for alternatively testing the setting of ids by the webapp
	var toggleIdSettingButton = null;

	// the button for syncing objects
	var syncObjectsButton = null;

	// a button for switching the crud impl
	var switchCRUDImplButton = null;

	/*
	 * the crud operations
	 */
	var crudops = new DataItemCRUDOperations();

	this.initialiseView = function() {
		// register a storage event handler - it will only react if the storage event is due to another window changing the storage
		window.addEventListener("storage", function(event) {
			console.log("got storage event " + event + ": " + event.key + " changed from " + event.oldValue + " to " + event.newValue);
			console.log("new value (read out from event.storageArea): " + event.storageArea.getItem(event.key));
		});

		console.log("online status is: " + navigator.onLine);

		// we read out the uielements from the view and set the event handlers
		/* not available in OFF
		 document.getElementById("createDB").onclick = function(event) {
		 crudops.openOrCreateDB();
		 }
		 document.getElementById("deleteDB").onclick = function(event) {
		 checkDeleteDB();
		 }
		 */
		createItemButton = document.getElementById("createItem");
		createItemButton.onclick = function(event) {
			var item = new DataItem();
			// set a title
			item.title = getDummyTitle();
			crudops.createItem(item, function(created) {
				addNewItemViewToListView(created);
			});
		}
		// read out the view's root and the popup dialog view
		viewRoot = document.getElementById("itemOverview");
		itemDialog = document.getElementById("itemDialog");

		itemDialogUpdateForm = document.getElementById("itemDialog-updateForm");
		itemDialogUpdate = document.getElementById("itemDialog-update");
		itemDialogDelete = document.getElementById("itemDialog-delete");
		itemDialogTitle = document.getElementById("itemDialog-title");
		
		// we set a listener on the view root that results in closing an open dialog
		viewRoot.addEventListener("click", function() {
			if (isItemDialogShown()) {
				hideItemDialog();
			}
		});

		// we also read out the itemlist to which the view for new item elements will be added and the "template" element for new items
		itemlistView = document.getElementById("itemlist");
		itemView = document.getElementById("itemlistElement");
		// we remove the itemView from the document
		itemView.parentNode.removeChild(itemView);

		/* not available in OFF
		// the following code deals with the button for toggling the id setting and just appears optimisable
		toggleIdSettingButton = document.getElementById("toggleIdSetting");
		toggleIdSettingButton.innerHTML = (crudops.isIdsByIndexedDB() ? "idsIDB" : "idsLDS");
		toggleIdSettingButton.onclick = function(event) {
		checkDeleteDB();
		if (crudops.isIdsByIndexedDB()) {
		alert("ids werden lokal vergeben!")
		toggleIdSettingButton.innerHTML = "idsLDS"
		} else {
		alert("ids werden durch DB vergeben!")
		toggleIdSettingButton.innerHTML = "idsIDB"
		}
		crudops.setIdsByIndexedDB(!crudops.isIdsByIndexedDB());
		localStorage.setItem("idsByIndexedDB", idsByIndexedDB ? "true" : "false");
		}
		*/

		/* new elements in off: sync data and install webapp */
		// we read out the uielements from the view and set the event handlers
		document.getElementById("installWebapp").onclick = function(event) {
			checkWebappInstalled("off.webapp");
		}
		
		// prepare the button that allows us to switch the crud impl
		switchCRUDImplButton = document.getElementById("switchCRUDImpl");
		var lastCRUDImpl = getLastCrudImplOption();
		switchCRUDImplButton.textContent = lastCRUDImpl;
		crudops.setCRUDImpl("crudimpl" + lastCRUDImpl)
		switchCRUDImplButton.disabled = false;
		// we prepare the button for switching
		switchCRUDImplButton.onclick = function(event) {
			var crudimpl = getNextCrudImplOption();
			switchCRUDImplButton.textContent = crudimpl;
			/* for initialising the new option and updating the view we simply refresh the listview */
			window.location.reload();
		}
		
		// depending on whether the operations support a sync function the button will be enabled or not
		syncObjectsButton = document.getElementById("syncObjects");
		if (crudops.syncObjects) {
			syncObjectsButton.disabled = false;
			syncObjectsButton.addEventListener("click", function() {
				crudops.syncObjects(function(updated) {
					alert("Synchronisation done!");
					// if there was an update we update the whole list view
					if (updated) {
						itemlistView.innerHTML = "";
						readAllItems();
					}
				});
			});
		} else {
			syncObjectsButton.disabled = true;
		}
				
		// we also add a callback that will be invoked once the availablility of crud operations changes due to changes in online/offline status */
		crudops.setOnCRUDAvailabilityChanged(function(online) {
			if (!online) {
				alert("The application is running in offline mode!");
			} else {
				alert("The application is running in online mode!");
			}

			// we set several actions as active / inactive depending on the availability
			itemDialogUpdate.disabled = !crudops.isCRUDAvailable("U");
			itemDialogDelete.disabled = !crudops.isCRUDAvailable("D");
			createItemButton.disabled = !crudops.isCRUDAvailable("C");
			syncObjectsButton.disabled = !crudops.isCRUDAvailable("C");
			itemDialogTitle.disabled = !crudops.isCRUDAvailable("U");

			console.log("status of buttons is: " + itemDialogUpdate.disabled + "/" + itemDialogDelete.disabled + "/" + createItemButton.disabled);
		});
		createItemButton.disabled = false;

		// then we initialise the db, passing a callback function that will be called once the db is available and our global 'db' variable has been set
		crudops.initialise(function() {
			crudops.readAllItems(function(item) {
				addNewItemViewToListView(item);
			});
		});
	}
	function checkDeleteDB() {
		if (confirm("Do you really want to clear all data from the database???")) {
			console.log("db will be deleted.");
			crudops.deleteDB();
			// also delete the db related localstorage entry
			localStorage.removeItem("lastObjectId");
		}
	}

	// add a new item element to the itemlist
	function addNewItemViewToListView(item) {
		// we need to clone the itemView element and use deep cloning (indicated by true) to also clone all the children of the element
		var newItemView = itemView.cloneNode(true);
		// add the item's data
		addItemDataToItemView(item, newItemView);
		// and add the view to the list
		itemlistView.appendChild(newItemView);
		// we also set an id on the element that allows us to identify it, e.g. for updating or removing it on item update and deletion
		newItemView.id = "item_" + item._id;
	}

	// this adds data of an item to an existing item view (used for create and update, therefore we check whether attributes are set)
	function addItemDataToItemView(item, itemview) {
		// and set an onclick listener on the view
		itemview.onclick = function(event) {
			// check whether we have an active dialog
			if (isItemDialogShown()) {
				hideItemDialog();
			} else {
				showItemDialog(item);
			}
		}
		// set the item title on this element
		if (item.title) {
			itemview.querySelector("h2").innerHTML = item.title;
		}
	}

	// show the dialog that allows to update or delete an item
	function showItemDialog(item) {
		console.log("showItemDialog()");

		// set the value to be displayed and the event handlers operating on the item
		itemDialogTitle.value = item.title;
		itemDialogUpdateForm.onsubmit = function() {
			crudops.updateItem(item, {
				title : itemDialogTitle.value
			}, function(updateditem) {
				// remove the element from the list view - for this purpose we have set the id values in addNewItemToListView
				var updatedItemView = document.getElementById("item_" + updateditem._id);
				addItemDataToItemView(updateditem, updatedItemView);
				hideItemDialog();
			});
			return false;
		}
		itemDialogDelete.onclick = function(event) {
			event.preventDefault();
			if (confirm("Do you want to delete this item?")) {
				crudops.deleteItem(item._id, function(deleted) {
					if (deleted) {
						// remove the element from the list view - for this purpose we have set the id values in addNewItemToListView
						var deletedItemView = document.getElementById("item_" + item._id);
						deletedItemView.parentNode.removeChild(deletedItemView);
						hideItemDialog();
					}
				});
			}
		}
		// then we trigger display of the dialog
		viewRoot.classList.toggle("mwf-dialog-shown");
		// for fading in the dialog, we first set it on mwf-hidden, then on mwf-shown
		itemDialog.classList.toggle("mwf-hidden");
		setTimeout(function() {
			itemDialog.classList.toggle("mwf-shown");
			itemDialog.classList.toggle("mwf-hidden");
		}, 100);
	}

	// check whether the dialog is shown
	function isItemDialogShown() {
		return itemDialog.classList.contains("mwf-shown");
	}

	// hide the dialog
	function hideItemDialog() {
		console.log("hideItemDialog");
		viewRoot.classList.toggle("mwf-dialog-shown");
		itemDialog.classList.toggle("mwf-shown");
	}

	/************************************************************
	 * show access to local storage
	 ************************************************************/

	// this is a dummy title generator :)
	var dummytitles = ["lorem", "ipsum", "dolor", "sit", "amet", "sed", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"];

	// the index of the last title that has been used will be read from the localStorage
	function getDummyTitle() {

		// check the value of the index
		var lastDummyTitleIndex = localStorage.getItem("lastDummyTitleIndex");
		console.log("getDummyTitle(): index is: " + lastDummyTitleIndex);
		if (!lastDummyTitleIndex) {
			console.log("getDummyTitle(): no dummy title index exists so far. Will use initial value.");
			lastDummyTitleIndex = -1;
		} else if (lastDummyTitleIndex >= (dummytitles.length - 1)) {
			console.log("getDummyTitle(): new dummy title index will exeed the length of the dummytitles array. Will reset it.");
			lastDummyTitleIndex = -1;
		}
		// we increase the index and replace the current value
		localStorage.setItem("lastDummyTitleIndex", ++lastDummyTitleIndex);

		// and then read out the object at the index position and return it
		return dummytitles[lastDummyTitleIndex];
	}

	// this is another functionality where we use the local storage: allow to switch between different implemenations of the crud operations
	var crudimpls = ["Local", "Remote", "Synced"];

	function getNextCrudImplOption() {
		var lastCrudImplOptionIndex = localStorage.getItem("lastCrudImplOptionIndex");
		if (!lastCrudImplOptionIndex || lastCrudImplOptionIndex > (crudimpls.length - 2)) {
			lastCrudImplOptionIndex = -1;
		}
		localStorage.setItem("lastCrudImplOptionIndex", ++lastCrudImplOptionIndex);

		return crudimpls[lastCrudImplOptionIndex];
	}

	function getLastCrudImplOption() {
		var lastCrudImplOptionIndex = localStorage.getItem("lastCrudImplOptionIndex");
		if (!lastCrudImplOptionIndex) {
			lastCrudImplOptionIndex = 0;
		}

		return crudimpls[lastCrudImplOptionIndex];
	}

}

vc = new ListviewViewController();
