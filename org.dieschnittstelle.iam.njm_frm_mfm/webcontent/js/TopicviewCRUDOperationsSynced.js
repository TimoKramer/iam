/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	// 141220: modified log message
	console.log("loading TopicviewCRUDOperationsSynced as submodule crud.synced of: " + JSON.stringify(iammodule));

	if (!iammodule.crud) {
		iammodule.crud = {};
	}

	/*
	 * we pass the topicid
	 */
	function TopicviewCRUDOperationsSynced(_topicid) {

		var topicid = _topicid;
		
		var localcrud = iam.crud.local.newInstance(topicid);
		var remotecrud = iam.crud.remote.newInstance();

		// the initialise function
		this.initialise = function(callback) {
            remotecrud.initialise(function() {
                localcrud.initialise(callback);
            });
		};
		
		/*
		 * the crud operations for topicview
		 */
		this.createTopicview = function(topicid, title, callback) {
            console.log("createTopicview()");
            remotecrud.createTopicview(topicview, title, function(createdTopicview) {
                localcrud.createTopicview(createdTopicview.topicid, createdTopicview.title, callback);
            });
        };

		this.readTopicview = function(topicid, callback) {
            localcrud.readTopicview(topicid, callback);
		};

		this.deleteTopicview = function(topicid, topicid_internal, callback) {

		};

		this.updateTopicview = function(topicid, update, callback) {

		};
		
		/*
		 * the crud operations for object
		 */
		this.createObject = function(obj, callback) {
            console.log("createObject(): " + obj);
            remotecrud.createObject(obj, function(createdObject) {
                localcrud.createObject(createdObject, callback);
            });
		};

		this.readObjectForTopicview = function(topicviewObj, callback) {
            localcrud.readObjectForTopicview(topicviewObj, callback);
		};

		this.readObject = function(objid, callback) {

		};

		this.updateObject = function(obj, callback) {

		};

		this.deleteObject = function(objid, callback) {

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
		this.readAllObjects = function(callback) {

		};
	}

	// a factory method
	function newInstance(topicid) {
		return new TopicviewCRUDOperationsSynced(topicid);
	}


	iammodule.crud.synced = {
		newInstance : newInstance
	};

	// return the module
	return iammodule;

})(iam || {});

