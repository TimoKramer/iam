/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	// 141220: modified log message
	console.log("loading TopicviewCRUDOperationsLocal as submodule crud.local of: " + iammodule);

	if (!iammodule.crud) {
		iammodule.crud = {};
	}

	/*
	 * we pass the topicid
	 */
	function TopicviewCRUDOperationsLocal(_topicid) {

		// this controls the way ids for objects are assigned - for full compliance with LDS2 manualids should be set to true. The demo from December 16, 2014 uses
		var manualids = false;
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
		}
		/*
		 * the crud operations for topicview
		 */
		this.createTopicview = function(topicid, title, callback) {

		}

		this.readTopicview = function(topicid, callback) {

		}

		this.deleteTopicview = function(topicid, topicid_internal, callback) {

		}

		this.updateTopicview = function(topicid, update, callback) {

		}
		/*
		 * the crud operations for object
		 */
		this.createObject = function(obj, callback) {
			if (manualids && !obj._id) {
				obj._id = nextId();
			}

		}

		this.readObjectForTopicview = function(topicviewObj, callback) {

		}

		this.readObject = function(objid, callback) {

		}

		this.updateObject = function(obj, callback) {

		}

		this.deleteObject = function(objid, callback) {

		}

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

		}
		/*
		 * this function is needed for creating the objectlist view
		 */
		this.readAllObjects = function(callback) {

		}
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
	}

	// return the module
	return iammodule;

})(iam || {});

