/**
 * @author Jörn Kreutel
 */

function IXDB() {

	/*
	 * a generic function that opens a - simple! - db with a set of objectstores or creates it if it does not exist yet.
	 *
	 * onstorecreated is a callback that can be provided for postprocessing a store after creation, e.g. for creating an index
	 */
	this.openOrCreateSimpleDB = function(dbname, version, objectstores, modifiers, onsuccess, onstorecreated, onerror) {

		if (!version || version == "") {
			version = 1;
		} else {
			version = parseInt(version);
		}

		console.log("openOrCreateDB() dbname: " + dbname);
		console.log("openOrCreateDB() version: " + version);

		// open the database, providing onerror and onsuccess handlers
		var request = indexedDB.open(dbname, version);
		if (onerror) {
			request.onerror = onerror;
		} else {
			request.onerror = function(event) {
				alert("Got error trying to create database: " + event.target.errorCode);
			};
		}

		// if an upgrade is needed for the db, onupgradeneeded will be called before onsuccess!
		request.onsuccess = function(event) {
			// onsuccess, the db will be accessible as the result of of the request
			db = request.result;
			console.log("open().onsuccess(): initialised db: " + db);

			if (onsuccess) {
				onsuccess(db);
			}
		};

		// on upgrade needed is invoked when the db is not available in the given version or when it has just been created
		request.onupgradeneeded = function(event) {
			console.log("open().onupgradeneeded()");
			var db = event.target.result;

			// we will create the object stores for which openOrCreate has been called
			console.log("open().onupgradeneeded(): create " + objectstores.length + " object stores for db: " + db);

			for (var i = 0; i < objectstores.length; i++) {
				var currentStore = objectstores[i];
				var currentModifiers = modifiers ? modifiers[i] : null;
				console.log("open().onupgradeneeded(): creating objectstore: " + currentStore);
				// by default, we will create the stores with autoincrement and without any further parameters
				var currentStoreObj = db.createObjectStore(currentStore, currentModifiers ? currentModifiers : {
					autoIncrement : true
				});

				// check whether we have been provided a callback for handling store creation
				if (onstorecreated) {
					onstorecreated(currentStore, currentStoreObj);
				}
			}

			console.log("open().onupgradeneeded(): done.");
		};
	};
	/*
	 * delete a db
	 */
	this.deleteDB = function(dbname) {
		console.log("deleting db: " + dbname);
		indexedDB.deleteDatabase(dbname);
		console.log("deletion done.");
	};
	/*************************
	 * simple CRUD operations
	 *************************/

	/*
	 * create an object - note that we pass the db from outside
	 */
	this.createObject = function(db, objectstore, object, onsuccess, onerror) {
		console.log("createObject(): objectstore: " + objectstore);

		// create a readwrite transaction, passing the store(s) which shall be accessed
		var transaction = db.transaction([objectstore], "readwrite");

		// set an oncomplete handler on the transaction - this will be called after all requests in the transaction will have been executed successfully
		transaction.oncomplete = function(event) {
			console.log("the object was saved successfully");
		};
		if (onerror) {
			transaction.onerror = onerror;
		} else {
			transaction.onerror = function(event) {
				alert("Got error trying to create object: " + event.target.errorCode);
			}
		};
		// access the object store to which the object shall be added from the transaction
		var objectStore = transaction.objectStore(objectstore);
		// create the request to add the object
		var request = objectStore.add(object);
		// add a callback to the request that sets the id created by the add function!
		request.onsuccess = function(event) {
			console.log("createObject(): got id: " + event.target.result);
			object._id = event.target.result;
			// and call the callback that will probably have been passed to the function - try moving this to transaction.oncomplete!
			if (onsuccess) {
				onsuccess(object);
			}
		};
	};
	
	/*
	 * read all objects from some store
	 */
	this.readAllObjects = function(db, objectstore, onsuccess, onerror) {
		console.log("createAllObjects(): objectstore: " + objectstore);

		var objects = new Array();

		// we create a transaction for the objectstore and access the store from that transaction
		var objectStore = db.transaction([objectstore]).objectStore(objectstore);
		// we then try to obtain a cursor for iterating over the store
		var objectStoreCursor = objectStore.openCursor();
		objectStoreCursor.onsuccess = function(event) {
			// as long as objects can be read out this function will be called
			var cursor = event.target.result;
			if (cursor) {
				console.log("found: " + cursor.key + "=" + cursor.value);
				// note that the id (cursor.key) will not be set on the object itself, i.e. we need to set it manually
				cursor.value._id = cursor.key;
				// we add the object to the objects array
				objects.push(cursor.value);
				// try to read out the next object - NOTE THAT APTANA WILL COMPLAIN ABOUT THE continue() FUNCTION - AND JUST IGNORE IT...
				cursor.
				continue();
			} else {
				console.log("No more objects found. Passing " + objects.length + " to onsuccess callback function...");
				onsuccess(objects);
			}
		};
		objectStoreCursor.onerror = function(event) {
			if (onerror) {
				onerror(event);
			} else {
				alert("Got error trying to read all objects from store " + objectstore + ": " + event.target.errorCode);
			}
		};
	};
	
	/*
	 * delete an object
	 */
	this.deleteObject = function(db, objectstore, id, onsuccess, onerror) {
		console.log("deleteObject(): " + id);

		// again, we create a transaction and obtain the objectstore from the transaction
		var objectStore = db.transaction([objectstore], "readwrite").objectStore(objectstore);

		// call the delete function - NOTE THAT APTANA WILL COMPLAIN...
		var request = objectStore.
		delete (parseInt(id));

		// the onsuccess callback
		request.onsuccess = function(event) {
			if (onsuccess) {
				onsuccess(true);
			} else {
				console.log("successfully deleted entry.");
			}
		};
		request.onerror = function(event) {
			console.error("got error deleting entry: " + event);
			if (onerror) {
				onerror(event);
			} else if (onsuccess) {
				onsuccess(false, event);
			}
		};

	};
	
	/*
	 * read a single object
	 */
	this.readObject = function(db, objectstore, id, onsuccess, onerror) {
		// we create a transaction
		var objectStore = db.transaction([objectstore]).objectStore(objectstore);
		// we create a get request, passing the id
		var request = objectStore.get(parseInt(id));
		// set the callbacks
		request.onerror = function(event) {
			if (onerror) {
				onerror();
			} else {
				console.error("got error reading entry for id " + id + ": " + event);
			}
		};
		request.onsuccess = function(event) {
			var entry = event.target.result;
			// set the id on the entry
			entry._id = id;
			if (onsuccess) {
				onsuccess(entry);
			} else {
				console.log("readObject(): no onsuccess callback specified...");
			}
		};
	};
	
	/*
	 * update an object
	 */
	this.updateObject = function(db, objectstore, id, update, onsuccess, onerror) {
		console.log("updateObject(): " + id + ", " + update);
		// and once again, we create a transaction and access the object store via that transaction
		var objectStore = db.transaction([objectstore], "readwrite").objectStore(objectstore);
		// strangely enough, put takes the key as second argument... note that if the _id is set on the update object, this operation will result in adding the _id attribute to the object store, as well
		var request = objectStore.put(update, parseInt(id));

		request.onsuccess = function(event) {
			console.log("updateObject(): onsuccess");
			if (onsuccess) {
				// we just feed back true/false
				onsuccess(true);
			} else {
				console.log("successfully updated object " + id + ". Got: " + event.target.result);
			}
		};
		request.onerror = function(event) {
			console.error("got error updating entry: " + event);
			if (onerror) {
				onerror(event);
			} else if (onsuccess) {
				onsuccess(false, event);
			}
		};
	};
	
	/*
	 * alternatively: update an object if we have specified a keypath - the difference is that the id must be set on the object itself and must not be passed as a second argument to the put operation
	 */
	this.updateObjectWithKeypath = function(db, objectstore, id, update, onsuccess, onerror) {
		console.log("updateObjectWithKeypath(): " + id + ", " + update);
		// and once again, we create a transaction and access the object store via that transaction
		var objectStore = db.transaction([objectstore], "readwrite").objectStore(objectstore);
		// well, this is the only difference to the updateObject() function
		var request = objectStore.put(update/*, id*/);

		request.onsuccess = function(event) {
			console.log("updateObjectWithKeypath(): onsuccess");
			if (onsuccess) {
				// we just feed back true/false
				onsuccess(true);
			} else {
				console.log("successfully updated object " + id + ". Got: " + event.target.result);
			}
		};
		request.onerror = function(event) {
			console.error("got error updating entry: " + event);
			if (onerror) {
				onerror(event);
			} else if (onsuccess) {
				onsuccess(false, event);
			}
		};
	};
}

var ixdb = new IXDB();
