/*
 * implementation of the crud operations using one of three storage modes: local, remote and (simple) synced
 */
/* this is the model class used by the demo application */
function DataItem(atitle, aimg) {
	this.title = atitle;
	this.img = aimg;
}

function DataItemCRUDOperations() {

	// the name of our database
	var dbname = "mydb";

	// the name of the objectstore (= 'database table' (SQL) / 'collection' (MongoDB)) used by our application
	var storename = "dataitems";

	// the db object
	var db = null;

	var crudimplLocal = new IndexDBCRUDOperationsImpl(dbname, 1, [storename], null, function(astorename, astoreobj) {
		console.log("store " + astorename + " has been created: " + astoreobj);
		if (astorename == "dataitems") {
			// the first argument specifies the name of the index, the second one the name of the attribute for which the index shall be created
			astoreobj.createIndex("titleindex", "title", {
				unique : false
			});
		}
	});

	var crudimplRemote = new Http2MdbCRUDOperationsImpl();

	var crudimplSynced = new RemoteMasterSyncedCRUDOperationsImpl(dbname, storename);

	// for executing the operations, we use a particular crud implementation
	var crudimpl;

	// the name of the variable that we shall use for crud will be set as a string and will then be evaluated
	this.setCRUDImpl = function(implname) {
		crudimpl = eval(implname);
		/*
		 * we take over a sync function from the crudimpl but need to wrap it into a new function as it needs to be passed the storename
		 */
		if (crudimpl.syncObjects) {
			this.syncObjects = function(callback) {
				crudimpl.syncObjects(storename, callback);
			};
		}
		this.isCRUDAvailable = crudimpl.isCRUDAvailable;
	}
	/*
	 * pass a callback to the crudimpl that will be notified if there are changes to availability of crud operations (e.g. if we are running in offline mode)
	 */
	this.setOnCRUDAvailabilityChanged = function(callback) {
		crudimpl.onCRUDAvailabilityChanged = callback;
	}

	this.deleteDB = function() {
		crudimpl.deleteDB();
	}
	/*
	 * the functions for creating/opening and deleting the db
	 */
	this.initialise = function(callback) {
		crudimpl.initialise(function() {
			callback();
		}, function() {
			alert("The CRUD Operations are not available!");
		}, function(error) {
			alert("Error initialing the CRUD Operations: " + error);
		});
	}
	/************************************************************
	 * the CRUD operations that will be called by the ui actions
	 ************************************************************/

	/*
	 * create an item
	 */
	this.createItem = function(item, callback) {
		crudimpl.createObject(storename, item, function(item) {
			console.log("createItem(): item has been created: " + JSON.stringify(item));
			if (callback) {
				callback(item);
			}
		});
	}
	/*
	 * read all items
	 */
	this.readAllItems = function(callback) {
		// the callback will be called once all objects have been read out - DEMO: show how we could use single callbacks?
		crudimpl.readAllObjects(storename, function(objects) {
			console.log("readAllItems(): read " + objects.length + " items");
			for (var i = 0; i < objects.length; i++) {
				if (callback) {
					callback(objects[i]);
				}
			}

			// for testing the readObject function, we iterate over the items once again, and call readObject for each of it
			// notice how we detect that we have actually read all objects!

			// we initialise a countdown
			var countdown = objects.length;
			for (var i = 0; i < objects.length; i++) {
				crudimpl.readObject(storename, objects[i]._id, function(readobj) {
					// we countdown
					countdown--;
					// show a log message
					console.log("read object with title: " + readobj.title);
					// check whether we are done
					if (countdown == 0) {
						console.log("all objects have been read out!");
					}
				});
			}
		});

	}
	/*
	 * delete an item
	 */
	this.deleteItem = function(id, callback) {
		crudimpl.deleteObject(storename, id, function(success) {
			if (success) {
				if (callback) {
					callback(true);
				}
			} else {
				alert("object " + id + " could not be deleted!")
			}
		});
	}
	/*
	 * update an item
	 */
	this.updateItem = function(item, update, callback) {
		// this is the callback method that will be used in any case
		var onupdatesuccess = function(success) {
			console.log("updateItem: success is: " + success);
			if (success) {
				// we add the update to the original item
				for (var attr in update) {
					item[attr] = update[attr];
				}
				if (callback) {
					callback(item);
				}
			} else {
				alert("object " + item.id + " could not be deleted!")
			}
		};

		crudimpl.updateObject(storename, item._id, update, onupdatesuccess);
	}
	function getNextId() {
		var lastId = localStorage.getItem("lastObjectId");
		if (!lastId) {
			lastId = 1000;
		}
		console.log("getNextId(): last id is: " + lastId);
		localStorage.setItem("lastObjectId", ++lastId);
		return lastId;
	}

}