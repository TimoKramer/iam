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

	var idsByIndexedDB;

	// instantiate the variable that controls whether ids are set by the db or by ourselves
	var idsetting = localStorage.getItem("idsByIndexedDB");
	console.log("idsByIndexedDB in localStorage: " + idsetting);
	if (idsetting == null || idsetting == undefined || idsetting == "") {
		idsByIndexedDB = true;
	} else {
		idsByIndexedDB = (idsetting == "true" ? true : false);
	}

	this.deleteDB = function() {
		ixdb.deleteDB(dbname);
	}

	this.setIdsByIndexedDB = function(onoff) {
		idsByIndexedDB = onoff;
	}

	this.isIdsByIndexedDB = function() {
		return idsByIndexedDB;
	}
	/*
	 * the functions for creating/opening and deleting the db
	 */
	this.initialise = function(callback) {
		ixdb.openOrCreateSimpleDB(dbname, 1, [storename], idsByIndexedDB ? null : [{
			keyPath : "_id"
		}],
		// this is the onsuccess callback function
		function(thedb) {
			console.log("The database is available: " + thedb);
			// we will keep a reference to the database in the global db variable
			db = thedb;
			if (callback) {
				callback();
			}
		},
		// this is the callback function that allows us, e.g., to set an index on the title attribute - note that this callback is part of our own api on top of indexeddb
		function(astorename, astoreobj) {
			console.log("store " + astorename + " has been created: " + astoreobj);
			if (astorename == "dataitems") {
				// the first argument specifies the name of the index, the second one the name of the attribute for which the index shall be created
				astoreobj.createIndex("titleindex", "title", {
					unique : false
				});
			}
		});
	}
	/************************************************************
	 * the CRUD operations that will be called by the ui actions
	 ************************************************************/

	/*
	 * create an item
	 */
	this.createItem = function(item, callback) {

		// check whether we shall add the id ourselves
		if (!idsByIndexedDB) {
			item._id = getNextId();
		}
		// call the database create operation
		ixdb.createObject(db, storename, item, function(item) {
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
		ixdb.readAllObjects(db, storename, function(objects) {
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
				ixdb.readObject(db, storename, objects[i]._id, function(readobj) {
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
		ixdb.deleteObject(db, storename, id, function(success) {
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

		// here there is a difference that depends on whether the db sets the ids or not
		if (idsByIndexedDB) {
			ixdb.updateObject(db, storename, item._id, update, onupdatesuccess);

		} else {
			update._id = parseInt(item._id);
			ixdb.updateObjectWithKeypath(db, storename, item._id, update, onupdatesuccess);
		}

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