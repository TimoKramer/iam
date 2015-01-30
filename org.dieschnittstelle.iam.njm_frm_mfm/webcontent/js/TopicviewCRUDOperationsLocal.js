/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	// 141220: modified log message
	console.log("loading TopicviewCRUDOperationsLocal as submodule crud.local of: " + JSON.stringify(iammodule));

	if (!iammodule.crud) {
		iammodule.crud = {};
	}

	/*
	 * we pass the topicid
	 */
	function TopicviewCRUDOperationsLocal(_topicid) {

		// this controls the way ids for objects are assigned - for full compliance with LDS2 manualids should be set to true. The demo from December 16, 2014 uses
		var manualids = true;
		var topicid = _topicid;

		// we create a local instance of the generic implementation of the crud operations. Three objectstores will be used:
		// - topicviews, identified by topicid
		// - objects, identified by the _id which will be assigned by indexeddb (if manualids are NOT used), or manually
		// - objectrefs (which will keep the references from topicviews to objects), identified by topicid
		if (!manualids) {
			var idbcrud = iam.indexeddb.newInstance("mydb1", 1, ["topicviews", "objects", "objectrefs"], [{
				keyPath : "topicid"
			}, null, {
				keyPath : "topicid"
			}], function(astorename, astoreobj) {
				console.log("created objectstore " + astorename + ": " + astoreobj);
			}, [false, true, false]);
		} else {
			var idbcrud = iam.indexeddb.newInstance("mydb2", 1, ["topicviews", "objects", "objectrefs"], [{
				keyPath : "topicid"
			}, {
				keyPath : "_id"
			}, {
				keyPath : "topicid"
			}], function(astorename, astoreobj) {
				console.log("created objectstore " + astorename + ": " + astoreobj);
			}, [false, false, false]);
		}

		// the initialise function
		this.initialise = function(callback) {
			idbcrud.initialise(callback, function() {
				alert("indexeddb is not available!");
			}, function() {
				alert("error trying to initialise indexeddb!");
			});
		};
		
		/*
		 * the crud operations for topicview
		 */
		this.createTopicview = function(topicid, title, callback) {
            console.log("createTopicview");
            idbcrud.createObject("topicviews", {topicid: topicid, title: title, content_items:[]}, function(created){
                console.log("created topicview: " + JSON.stringify(created));
                callback(created);
            });
		};

		this.readTopicview = function(topicid, callback) {
            console.log("readTopicview");
            idbcrud.readObject("topicviews", topicid, function(topicviewObj) {
                // try to read objectref for the topicid
                idbcrud.readObject("objectrefs", topicid, function(objectref) {
                    console.log("found objectref for topicid " + topicid);
                    topicviewObj.content_items.push(objectref);
                    callback(topicviewObj);
                },
                function() {
                    console.log("found no objectref for topicid " + topicid);
                    callback(topicviewObj);
                });
                // if one exists, we add it to content_items of topicviewObj
            }, function(){
                callback();
            });
		};

		this.updateTopicview = function(topicid, update, callback) {
            console.log("updateTopicview with topicid: "+ topicid + " and new title: " + JSON.stringify(update));
            idbcrud.updateObject("topicviews", topicid, update, function(response) {
                //alert(response);
                callback(response);
            });
		};
		
		
		this.deleteTopicview = function(topicid, id, callback) {
		    console.log("deleteTopicview with topicid: " + topicid + " and id: " + id);
		    idbcrud.deleteObject("topicviews", topicid, function(updated) {
		        console.log("Topicview deleted " + JSON.stringify(updated));
		        topicviewObj = "";
		        console.log("topicviewObj deleted: " + JSON.stringify(topicviewObj));
		    });
		};
		
		/*
		 * the crud operations for object
		 */
		this.createObject = function(obj, callback) {
			if (manualids && !obj._id) {
				obj._id = nextId();
			}
            console.log("create object");
            idbcrud.createObject("objects", obj, function(created){
                idbcrud.createObject("objectrefs", {
                    topicid: topicid,
                    type: "objekt",
                    objektid: created._id
                }, function(objrefcreated) {
                    console.log("created objectref: " + JSON.stringify(objrefcreated));
                    callback(created);
                });
            });
		};

		this.readObjectForTopicview = function(topicviewObj, callback) {
            console.log("topicviewObj: " + JSON.stringify(topicviewObj));
            var objectFound = false;
            for (var i=0; i < topicviewObj.content_items.length; i++) {
                var currentItem = topicviewObj.content_items[i];
                if (currentItem.type == "objekt") {
                    this.readObject(currentItem.objektid, callback);
                    objectFound = true;
                    break;
                }
            }
		};

		this.readObject = function(objid, callback) {
            console.log("readObject(): " + objid);
            idbcrud.readObject("objects", objid, callback);
		};

		this.updateObject = function(obj, id, callback) {

		};

		this.deleteObject = function(objid, callback) {
            console.log("deleteObject in topicid: " + topicid);
            idbcrud.deleteObject("objects", topicid, function(updated) {
                console.log("Objekt deleted " + JSON.stringify(updated));
                if (updated) {
                    idbcrud.deleteObject("objectrefs", topicid, callback);
                }
            });

		};

		/*
		 * the id of the objekt to be deleted is determined given the content_items array of topicviewObj
		 *
		 * note that in order for this to work the objekt reference must be set in content_items. 
		 * Currently this is only the case if the objekt element has already been created when entering a topicview. 
		 * If an objekt is created, currently the reference is set/created in the db afterwards (mongodb or indexeddb), 
		 * but not added to the local topicviewObj used by TopicviewViewController.
		 *
		 * adding of references could be done within an event handler for objekt creation in TopicviewViewController
		 */
		this.deleteObjectForTopicview = function(topicviewObj, callback) {

		};
		
		/*
		 * this function is needed for creating the objectlist view
		 */
		this.readAllObjects = function(topicid, callback) {
            console.log("READING OBJECT FOR TOPICID!!!!!");
            this.readTopicview(topicid, function(response) {
                console.log("GOT RESPONSE FROM READTOPICVIEW" + JSON.stringify(response));
                for (var i = 0 ; i<response.content_items.length; i++) {
                    if(response.content_items[i].type == "objekt") {
                        console.log("found content_items type objekt: " + JSON.stringify(response.content_items[i]));
                        crudops.readObject(response.content_items[i].objektid, function(data) {
                            console.log("READOBJECTFORTOPICID returns data: " + JSON.stringify(data));
                            callback(data);
                        });
                        
                    }
                }
            });
		};
		
		/*
		 * a helper function that gives us a String-valued id based on the current time - this is required for LDS2, requirement 2 (local ids)
		 */
		function nextId() {
			return new Date().getTime().toString();
		}

	}

	// a factory method
	function newInstance(topicid) {
		return new TopicviewCRUDOperationsLocal(topicid);
	}


	iammodule.crud.local = {
		newInstance : newInstance
	};

	// return the module
	return iammodule;

})(iam || {});

