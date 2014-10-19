/**
 * @author Jörn Kreutel
 */
/*
* initialise the access to the mdb
*/
// access the db
var databaseUrl = "mme2db";

// initialise the db using the mdbjs javascript api (here, we do not specify which collection to access as this is up to the user of this api)
var db = require("mdbjs").connect(databaseUrl);

// use our own utility functions
var utils = require("./njsutils");

console.log("got db: " + db);

/*
 * an object type that represents the information contained in a uri and provides it via the attributes collection, objectid and furtherpath (the latter will not be used here)
 */
function MDBRequest(uri) {

    var segments = uri.split("/");
    console.log("MDBRequest(): segments are: " + segments)

    if (segments.length > 0 && segments[0].length > 0) {
        this.collection = segments[0];
        console.log("MDBRequest.collection: " + this.collection);
    }
    if (segments.length > 1 && segments[1].length > 0) {
        try {
            this.objectid = require("mdbjs").ObjectId(segments[1]);
        } catch (exception) {
            console.log("got exception: " + exception + ". This might be due to using an _id that has been assigned remotely: " + segments[1]);
            this.objectid = segments[1];//parseInt(segments[1]);
        }
        console.log("MDBRequest.objectid: " + this.objectid);
    }
    if (segments.length > 2 && segments[2].length > 0) {
        this.furtherpath = segments[2];
        console.log("MDBRequest.furtherpath: " + this.furtherpath);
    }

}

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

        // we truncate the url
        var uri = utils.substringAfter(req.url, "/http2mdb/");

        // we assume the rest of the url specifies the collection and possibly object to be accessed and wrap this information in a special type of object
        var mdbrequest = new MDBRequest(uri);

        // load the collection
        var collection = db.collection(mdbrequest.collection);

        if (collection) {
            if (req.method == "GET") {
                if (mdbrequest.objectid) {
                    readObject(collection, mdbrequest.objectid, req, res);
                } else {
                    readAllObjects(collection, req, res);
                }
            } else if (req.method == "POST") {
                createObject(collection, req, res);
            } else if (req.method == "PUT") {
                updateObject(collection, mdbrequest.objectid, req, res);
            } else if (req.method == "DELETE") {
                deleteObject(collection, mdbrequest.objectid, req, res);
            } else {
                console.error("cannot handle request method: " + req.method);
                res.writeHead(405);
                res.end();
            }
        } else {
            console.error("request does not seem to specifiy a collection: " + uri + "!");
            res.writeHead(400);
            res.end();
        }
    }
}

/*
 * read a single object
 */
function readObject(collection, objectid, req, res) {
    console.log("readObject(): " + objectid);

    collection.find({
        _id : objectid
    }, function(err, elements) {
        if (err || !elements) {
            console.log("Error accessing collection! " + err ? err : "");
            respondError(res);
        } else if (elements.length == 0) {
            console.error("the element with id " + objectid + " could be found inside of the collection.");
            respondError(res, 404);
        } else {
            console.log("readObject(): found " + elements.length + " elements.");
            respondSuccess(res, elements[0]);
        }
    });
}

function readAllObjects(collection, req, res) {
    console.log("readAllObjects()");

    collection.find(function(err, elements) {
        if (err || !elements) {
            console.log("Error accessing collection: " + err + "!");
            respondError(res);
        } else {
            console.log("readAllObjects(): found " + elements.length + " elements.");
            respondSuccess(res, elements);
        }
    });
}

function createObject(collection, req, res) {
    console.log("createObject()");

    // with .on() for "data" we read out the request body - we will get it passed via the callback function
    // note that here we have a callback inside of a callback!
    req.on("data", function(data) {
        console.log("createObject(): data is: " + data);
        // parse the data
        var parseddata = JSON.parse(data);
        // and save it to the collection
        collection.save(parseddata, function(err, saved) {
            if (err || !saved) {
                console.error("object data could not be saved: " + err);
                respondError(res);
            } else {
                console.log("createObject(): saved object is: " + JSON.stringify(saved));
                // and respond
                respondSuccess(res, saved);
            }
        })
    });
}

function deleteObject(collection, objectid, req, res) {
    console.log("deleteObject(): " + objectid);

    collection.remove({
        _id : objectid
    }, function(err, update) {
        if (err || !update) {
            console.log("object " + objectid + " could not be deleted. Got: " + err);
            respondError(res);
        } else {
            console.log("object " + objectid + " was deleted. Got: " + update);
            respondSuccess(res, update);
        }
    });
}

function updateObject(collection, objectid, req, res) {
    console.log("updateObject(): " + objectid);

    // we read out the data and then update the db with the data being passed
    req.on("data", function(data) {
        console.log("updateObject(): data is: " + data);
        // parse the data
        var parseddata = JSON.parse(data);
        // and update it to the collection - note that we can directly pass the data received to the update function
        collection.update({
            _id : objectid
        }, {
            $set : parseddata
        }, function(err, updated) {
            if (err || !updated) {
                console.error("object data could not be updated: " + err);
                respondError(res);
            } else {
                console.log("updateObject(): update done: " + updated);
                // and respond
                respondSuccess(res, updated);
            }
        })
    });
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
