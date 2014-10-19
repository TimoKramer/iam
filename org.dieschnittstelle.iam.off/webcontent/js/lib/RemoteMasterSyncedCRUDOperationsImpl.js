/**
 * @author Jörn Kreutel
 *
 *
 * this class implements a simple sync mechanism where the local db is the master of the content
 *
 */
function RemoteMasterSyncedCRUDOperationsImpl(dbname, storename) {

    // keep a reference to ourselves which we can use in contexts where "this" does not refer to ourselves
    var self = this;

    // we track whether we are online or not
    var remoteAvailable = navigator.onLine;
    console.log("remoteAvailable is: " + remoteAvailable);

    // use an error callback for capturing loss of connectivity - the callback will be invoked from the xhr implementation
    var onRemoteError = function(xmlhttp) {
        if (!navigator.onLine || xmlhttp.status == 0) {
            console.log("the remote storage is not available!");
            onRemoteUnavailable();
        } else {
            alert("Got error trying to access the remote storage. Http status code is: " + xmlhttp.status);
        }
    }
    // this function will be called if initially or during usage the remote application is not available
    function onRemoteUnavailable() {
        remoteAvailable = false;
        // check whether we have a callback function for reacting to a change of availability - this will be set from outside!
        if (self.onCRUDAvailabilityChanged) {
            self.onCRUDAvailabilityChanged(false);
        } else {
            alert("The remote storage is not available. App will run in offline mode.");
        }
    }

    // we use the two other implementations that access the local db and the remote data storage, respectively and initialise the local db with a keyPath, i.e. ids will not be assigned automatically, but will be determined by ourselves, i.e. by the remote storage
    var localOperations = new IndexDBCRUDOperationsImpl(dbname + "_synced", 1, [storename], [{
        keyPath : "_id"
    }], function(astorename, astoreobj) {
        console.log("store " + astorename + " has been created: " + astoreobj);
        if (astorename == "dataitems") {
            // the first argument specifies the name of the index, the second one the name of the attribute for which the index shall be created
            astoreobj.createIndex("titleindex", "title", {
                unique : false
            });
        }
    },
    /* we declare that ids should not be parsed as ints but be treated as strings! */
    true);

    var remoteOperations = new Http2MdbCRUDOperationsImpl();

    /*
     * the operations
     */

    this.createObject = function(objectstore, object, onsuccess, onerror) {
        console.log("createdObject: " + JSON.stringify(object));
        remoteOperations.createObject(objectstore, object, function(created) {
            localOperations.createObject(objectstore, created, onsuccess, onerror);
        }, onRemoteError);
    }
    /* read access is only done locally. Synchronisation with the remote master is done separately available */
    this.readAllObjects = function(objectstore, onsuccess, onerror) {
        localOperations.readAllObjects(objectstore, onsuccess, onerror);
    }

    this.readObject = function(objectstore, id, onsuccess, onerror) {
        localOperations.readObject(objectstore, id, onsuccess, onerror);
    }

    this.deleteObject = function(objectstore, id, onsuccess, onerror) {
        remoteOperations.deleteObject(objectstore, id, function(deleted) {
            if (deleted) {
                localOperations.deleteObject(objectstore, id, onsuccess, onerror);
            }
        }, onRemoteError);
    }

    this.updateObject = function(objectstore, id, update, onsuccess, onerror) {
        remoteOperations.updateObject(objectstore, id, update, function(deleted) {
            if (deleted) {
                // the update operation differs for the case where we have an objectstore with externally assigned keys
                update._id = id;
                // the true argument specifies that we are using a keypath!
                localOperations.updateObject(objectstore, id, update, onsuccess, onerror, true);
            }
        }, onRemoteError);
    }
    /*
     * we initialise both the remote and the local operations
     */
    this.initialise = function(callback) {
        remoteOperations.initialise(function() {
            localOperations.initialise(function() {
                // on initialisation, we sync the data
                syncObjects(storename, function() {
                    callback();
                });
            });
        }, function() {
            onRemoteUnavailable();
            localOperations.initialise(callback);
        });
    }
    /*
     * this function synchronises the items with regard to their existence, i.e. we do not check whether some content has changed
     */
    var syncObjects = function(objectstore, onsuccess, onerror) {

        // we first check whether all local objects exist remotely and remove objects that do not exist anymore
        // then we check whether all remote objects exist locally and update if this is the case

        // track whether we have an update over both parts
        var updated = false;

        // the second function is called from two places from inside the first one, therefore we declare it here
        var createRemoteCreated = function() {
            remoteOperations.readAllObjects(objectstore, function(objects) {
                // for each object, we check whether it exists locally
                console.log("read " + objects.length + " remote objects");
                // we need to use a countdown as all read / write operations are done asynchronously!
                var countdown = objects.length;
                if (countdown > 0) {
                    for (var i = 0; i < objects.length; i++) {
                        var object = objects[i];
                        console.log("reading object with id: " + object._id);
                        // we check whether the object is available locally
                        localOperations.readObject(objectstore, object._id, function() {
                            countdown--;
                            // note that we do not update local objects with remote content. For doing this, we would need to add an update call to localOperations here.
                            if (countdown == 0) {
                                if (onsuccess) {
                                    console.log("createRemoteCreated() done...");
                                    onsuccess(updated);
                                }
                            }
                        },
                        // onerror we assume that the object does not exist.
                        function(event, context) {
                            localOperations.createObject(objectstore, context.object, function(created) {
                                updated = true;
                                countdown--;
                                if (countdown == 0) {
                                    if (onsuccess) {
                                        console.log("createRemoteCreated() done...");
                                        onsuccess(updated);
                                    }
                                }
                            });
                        }, {
                            object : object
                        });
                    }
                } else {
                    onsuccess(updated);
                }
            }, onerror);
        }
        // this is the one that deletes those ones locally that do not exist remotely
        localOperations.readAllObjects(objectstore, function(allobjects) {
            var countdown = allobjects.length;
            if (countdown > 0) {
                for (var i = 0; i < allobjects.length; i++) {
                    var object = allobjects[i];
                    remoteOperations.readObject(objectstore, object._id, function(obj) {
                        countdown--;
                        if (countdown == 0) {
                            console.log("deleteRemoteDeleted() done...");
                            createRemoteCreated();
                        }
                    }, function(xmlhttp, context) {
                        updated = true;
                        if (xmlhttp.status == 404) {
                            localOperations.deleteObject(objectstore, context.object._id, function(deleted) {
                                countdown--;
                                if (countdown == 0) {
                                    console.log("deleteRemoteDeleted() done...");
                                    createRemoteCreated();
                                }
                            });
                        }
                    }, {
                        object : object
                    });
                }
            } else {
                createRemoteCreated();
            }
        });
    }
    this.syncObjects = syncObjects;

    this.isCRUDAvailable = function(operation) {
        var op = operation.toLowerCase();
        if (op == "c" || op == "u" || op == "d") {
            return remoteAvailable;
        }
        return true;
    }

    this.deleteDB = function() {
        localOperations.deleteDB();
    }
}
