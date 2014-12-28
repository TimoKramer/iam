/**
 * @author Jörn Kreutel
 */
/*
* initialise the access to the mdb
*/
// access the db
var databaseUrl = "mme2db";

// use two collections:
// - topicview will store the whole configuration of a topicview (e.g. 'Die Umsiedlerin')
// - objects will store all "objects" that will be displayed on some topicview
var collections = ["topicviews", "objects"];

// initialise the db using the mdbjs javascript api and specify which collections should be accessed
var db = require("mdbjs").connect(databaseUrl, collections);

// use our own utility functions
var utils = require("./njsutils");

console.log("got db: " + db);

/* MFM: import the components required for multipart request ("file upload") processing
 the class must be imported like this, otherwise its instances will not keep their state */
var MultipartReader = require("./multipart").MultipartReader;
var multipart = require("./multipart");

/*
 * we export the processRequest method that will be passed the request and response object and will dispatch to local methods depending on the type of request
 */
module.exports = {

	/* this method dispatches request depending on the request method, comparable to the servlet api */
	processRequest : function processRequest(req, res) {

		console.log("processRequest(): req: " + req);
		console.log("processRequest(): req.method: " + req.method);
		console.log("processRequest(): req.url: " + req.url);
		console.log("processRequest(): req header user-agent: " + req.headers["user-agent"]);
		console.log("processRequest(): req header host: " + req.headers["host"]);
		console.log("processRequest(): req header content-type: " + req.headers["content-type"]);

		// we truncate the url
		var uri = utils.substringAfter(req.url, "/http2mdb");

		if (req.method == "GET") {
			doGet(uri, req, res);
		} else if (req.method == "POST") {
			doPost(uri, req, res);
		} else if (req.method == "PUT") {
			doPut(uri, req, res);
		} else if (req.method == "DELETE") {
			doDelete(uri, req, res);
		} else {
			console.error("cannot handle request method: " + req.method);
			res.writeHead(404);
			res.end();
		}
	}
};

/*
 * the top-level methods for handling the requests: the uri identifies which collection shall be accessed
 */
function doGet(uri, req, res) {
	console.log("doGet(): " + uri);

	if (utils.startsWith(uri, "/topicviews")) {
		readTopicview(utils.substringAfter(uri, "/topicviews/"), req, res);
	} else if (utils.startsWith(uri, "/objects")) {
		readObject(utils.substringAfter(uri, "/objects/"), req, res);
	} else {
		res.writeHead(404);
		res.end();
	}
}

function doPost(uri, req, res) {
	console.log("doPost(): " + uri);
	// MFM: check whether we have a multipart request
	if (utils.startsWith(req.headers["content-type"], "multipart/form-data;")) {
		handleMultipartRequest(uri, req, res);
	} else if (utils.startsWith(uri, "/topicviews")) {
		createTopicview(utils.substringAfter(uri, "/topicviews/"), req, res);
	} else if (utils.startsWith(uri, "/objects")) {
		createObject(utils.substringAfter(uri, "/objects/"), req, res);
	} else {
		res.writeHead(404);
		res.end();
	}
}

function doDelete(uri, req, res) {
	console.log("doDelete(): " + uri);
	if (utils.startsWith(uri, "/topicviews")) {
		deleteTopicview(utils.substringAfter(uri, "/topicviews/"), req, res);
	} else if (utils.startsWith(uri, "/objects")) {
		deleteObject(utils.substringAfter(uri, "/objects/"), req, res);
	} else {
		res.writeHead(404);
		res.end();
	}
}

function doPut(uri, req, res) {
	console.log("doPut(): " + uri);
	if (utils.startsWith(uri, "/topicviews")) {
		updateTopicview(utils.substringAfter(uri, "/topicviews/"), req, res);
	} else {
		res.writeHead(404);
		res.end();
	}
}

/*
 * MFM: the method for handling multipart requests
 */
function handleMultipartRequest(uri, req, res) {
	console.log("handleMultipartRequest(): " + uri);
	multipart.handleMultipartRequest(req, res, "./webcontent/", "content/", function ondone(formdata) {
		console.log("got formdata: " + JSON.stringify(formdata));
		respondMultipart(req, res, uri, formdata);
	});
}

/*
 * the methods for handling requests for topicviews
 */
function readTopicview(uri, req, res) {
	console.log("readTopicview(): " + uri);

	// the uri segment that we will get passed here is the id of the topic
	if (uri.length > 0) {
		// try to read out the topicview element from the db
		db.topicviews.find({
			topicid : uri
		}, function(err, elements) {
			if (err || !elements) {
				console.log("Error accessing topicview!");
				respondError(res);
			} else if (elements.length == 0) {
				console.error("no topicview element could be found.");
				respondError(res, 404);
			} else {
				// we only use the first element we find (there shouldn't be more elements, though...)
				console.log("readTopicview(): found " + elements.length + " elements.");
				respondSuccess(res, elements[0]);
			}
		});
	}
	/*
	 * in FRM hinzugefügt
	 * if no uri is specified we read out all topicviews
	 */
	else {
		console.log("reading out all topicviews...");
		// try to read out the topicview element from the db
		db.topicviews.find(function(err, elements) {
			if (err || !elements) {
				console.log("Error accessing topicview!");
				respondError(res);
			} else if (elements.length == 0) {
				console.error("no topicview element could be found.");
				respondError(res, 404);
			} else {
				// we only use the first element we find (there shouldn't be more elements, though...)
				console.log("readTopicview(): found " + elements.length + " elements.");
				respondSuccess(res, elements);
			}
		});
	}
}

function createTopicview(uri, req, res) {
	console.log("createTopicview(): " + uri);

	var contentType = req.headers["content-type"];
	console.log("createTopicview(): Content-Type is: " + contentType);
	/*
	 * in FRM hinzugefügt
	 * if we do not have json data, respond an error
	 */
	if (contentType == null || contentType.indexOf("application/json") == -1) {
		console.log("createTopicview(): cannot process content type: " + req.headers["Content-Type"]);
		respondError(res, 400);
	}

	// with .on() for "data" we read out  a chunnk of the request body which we append to a local variable
	// the chunk will be passed via the callback function
	// for small request bodies, the callback will possibly be called only once
	var alldata = "";
	req.on("data", function(data) {
		alldata += data;
	});

	// the "end" event will be triggered once the request body has been read out completely
	req.on("end", function() {
		console.log("createTopicview(): data is: " + alldata);
		// parse the data
		var parseddata = JSON.parse(alldata);
		// and save it to the topicviews collection
		db.topicviews.save(parseddata, function(err, saved) {
			if (err || !saved) {
				console.error("topic data could not be saved: " + err);
				respondError(res);
			} else {
				console.log("createTopicview(): saved object is: " + JSON.stringify(saved));
				// and respond
				respondSuccess(res, saved);
			}
		});
	});
}

function createObject(uri,req,res) {
	
	var alldata = "";
	
	req.on("data", function(data){
		alldata += data;
	});
	
	req.on("end", function(){
		console.log("received data: " + alldata);
		db.objects.save(JSON.parse(alldata), function(err, saved){
			if (err || !saved) {
				console.err("got error: " + err);
				respondError(res);
			}
			else {
				respondSuccess(res, saved);
			}
		});
		respondSuccess(res, JSON.parse(alldata));
	});
}

function readObject(uri, req, res) {
	if (uri.length > 0) {
		
		var internalid = require("mdbjs").ObjektId(uri);
		
		db.objects.find({_id: internalid},function(err, elements) {
			if (err || !elements) {
				console.err("got error: " + err);
				respondError(res);
			} else if (elements.length == 0) {
				console.log("da ist nix");
				respondError(res, 404);
			} else {
				respondSuccess(res, elements[0]);
			}
		});
	} else {
		// read all
		db.objects.find(function(err, elements) {
			if (err || !elements) {
				console.err("got error: " + err);
				respondError(res);
			} else if (elements.length == 0) {
				console.log("da ist nix");
				respondError(res, 404);
			} else {
				respondSuccess(res, elements);
			}
		});
	}
}

function deleteTopicview(uri, req, res) {
	console.log("deleteTopicview(): " + uri);

	// here, we demonstrate how deletion of an element from a collection can be dealt with
	if (uri && uri.indexOf("/content_items/") != -1) {
		console.log("uri specifies an element to be removed from the content_items list: " + uri);
		// we assume that the type of element to be deleted is given by the last uri segment
		var segments = uri.split("/");
		var topicid = segments[0];
		var type2delete = segments[segments.length - 1];
		console.log("will try to remove element of type " + type2delete + " from content_items of topicview with topicid " + topicid);
		db.topicviews.update({
			topicid : topicid
		}, {
			$pull : {
				"content_items" : {
					type : type2delete
				}
			}
		}, function(err, updated) {
			if (err || !updated) {
				console.error("type " + type2delete + " could not be removed from content_items: " + err);
				respondError(res);
			} else {
				console.log("deleteTopicview(): delete done: " + updated);
				// and respond
				respondSuccess(res, updated);
			}
		});
	} else {
		// MFM: the uri segment we get here is the internal _id that has been assigned by the database. The string value we get here needs to be converted to an id value using the ObjectID function
		var convertedid = require("mdbjs").ObjectId(uri);

		db.topicviews.remove({
			// topicid : uri
			_id : convertedid
		}, function(err, update) {
			if (err || !update) {
				console.log("topicview " + uri + " could not be deleted. Got: " + err);
				respondError(res);
			} else {
				console.log("topicview " + uri + " was deleted. Got: " + update);
				respondSuccess(res, update);
			}
		});
	}
}

function deleteObject(){
	console.log("deleteObject(): " + uri);
	if (uri && uri.indexOf("/content_items/") != -1) {
		console.log("uri specifies an element to be removed from the content_items list: " + uri);
		// we assume that the type of element to be deleted is given by the last uri segment
		var segments = uri.split("/");
		var topicid = segments[0];
		var type2delete = segments[segments.length - 1];
		console.log("will try to remove element of type " + type2delete + " from content_items of topicview with topicid " + topicid);
		db.topicviews.update({
			topicid : topicid
		}, {
			$pull : {
				"content_items" : {
					type : type2delete
				}
			}
		}, function(err, updated) {
			if (err || !updated) {
				console.error("type " + type2delete + " could not be removed from content_items: " + err);
				respondError(res);
			} else {
				console.log("deleteTopicview(): delete done: " + updated);
				// and respond
				respondSuccess(res, updated);
			}
		});
	} else {
		// MFM: the uri segment we get here is the internal _id that has been assigned by the database. The string value we get here needs to be converted to an id value using the ObjectID function
		var convertedid = require("mdbjs").ObjectId(uri);

		db.topicviews.remove({
			// topicid : uri
			_id : convertedid
		}, function(err, update) {
			if (err || !update) {
				console.log("topicview " + uri + " could not be deleted. Got: " + err);
				respondError(res);
			} else {
				console.log("topicview " + uri + " was deleted. Got: " + update);
				respondSuccess(res, update);
			}
		});
	}
};

function updateTopicview(uri, req, res) {
	console.log("updateTopicview(): " + uri);

	// check whether the uri ends with "/content_items" - in this case, we have an update of the contentItems list
	if (utils.endsWith(uri, "/content_items")) {
		// we extract the topicid from the uri
		var topicid = uri.split("/")[0];
		console.log("updateTopicview(): updating content_items for topicid: " + topicid);
		// we read out the data, create a json object from it and add the element to the content_items collection
		var alldata = "";
		req.on("data", function(data) {
			alldata += data;
		});
		req.on("end", function() {
			console.log("updateTopicview(): data is: " + alldata);
			// parse the data
			var parseddata = JSON.parse(alldata);
			// and update the content_items using the $push operation!
			db.topicviews.update({
				topicid : topicid
			}, {
				$push : {
					"content_items" : parseddata
				}
			}, function(err, updated) {
				if (err || !updated) {
					console.error("content_items could not be updated: " + err);
					respondError(res);
				} else {
					console.log("updateTopicview(): update done: " + updated);
					// and respond
					respondSuccess(res, updated);
				}
			});
		});
	} else {
		console.log("updateTopicview(): topicid is: " + topicid);
		// we read out the data and then update the db with the data being passed
		var alldata = "";
		req.on("data", function(data) {
			alldata += data;
		});
		req.on("end", function() {
			console.log("updateTopicview(): data is: " + alldata);
			// parse the data
			var parseddata = JSON.parse(alldata);
			// and update it to the topicviews collection - note that we can directly pass the data received to the update function
			db.topicviews.update({
				topicid : uri
			}, {
				$set : parseddata
			}, function(err, updated) {
				if (err || !updated) {
					console.error("topic data could not be updated: " + err);
					respondError(res);
				} else {
					console.log("updateTopicview(): update done: " + updated);
					// and respond
					respondSuccess(res, updated);
				}
			});
		});
	}
}

/*
 * utility functions for sending success and error responses
 */

function respondSuccess(res, json) {
	if (json) {
		res.writeHead(200, {
			'Content-Type' : 'application/json'
		});
		res.write(JSON.stringify(json));
	} else {
		res.writeHead(200);
	}
	res.end();
}

function respondError(res, code) {
	res.writeHead( code ? code : 500);
	res.end();
}

/* MFM: function for responding the result of multipart request processing: we send a script that invokes an onMultipartResponse() callback */
function respondMultipart(req, res, uri, content) {
	console.log("respondMultipart(): " + uri);
	respondSuccess(res, content);
}

