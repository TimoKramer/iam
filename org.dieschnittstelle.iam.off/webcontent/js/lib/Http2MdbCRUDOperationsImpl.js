/**
 * @author Jörn Kreutel
 *
 *
 * this class implements the generic crud api accessing the web service provided by the http2mdb implementation for nodejs -- in fact any web service that supports the latter's API could be accessed.
 */
function Http2MdbCRUDOperationsImpl() {

    // the initialisation function is currently implemented rather trivially, only checking whether we have network connectivity
    this.initialise = function(onavailable, onunavailable, onerror) {
        if (!navigator.onLine) {
            onunavailable();
        } else {
            xhr("GET", "available", null, onavailable, function(xmlhttp) {
                console.log("got error when checking availability...");
                if (xmlhttp.status == 0) {
                    onunavailable()
                } else {
                    if (onerror) {
                        onerror(xmlhttp);
                    } else {
                        alert("Got error checking remote availability. Status code is: " + xmlhttp.status);
                    }
                }
            });
        }
    }

    this.readObject = function(collection, objectid, onsuccess, onerror, context) {
        xhr("GET", "http2mdb/" + collection + "/" + objectid, null, function(xmlhttp) {
            // parse the response body
            var json = JSON.parse(xmlhttp.responseText);
            // call the callback
            onsuccess(json, context);
        }, function(xmlhttp) {
            onerror(xmlhttp, context);
        });
    }

    this.readAllObjects = function(collection, onsuccess, onerror, context) {
        xhr("GET", "http2mdb/" + collection, null, function(xmlhttp) {
            // parse the response body
            var json = JSON.parse(xmlhttp.responseText);
            // call the callback
            onsuccess(json, context);
        }, function(xmlhttp) {
            if (onerror) {
                onerror(xmlhttp, context);
            }
        });
    }

    this.createObject = function(collection, object, onsuccess, onerror, context) {
        xhr("POST", "http2mdb/" + collection, object, function(xmlhttp) {
            // parse the response body
            var json = JSON.parse(xmlhttp.responseText);
            // call the callback
            onsuccess(json, context);
        }, function(xmlhttp) {
            onerror(xmlhttp, context);
        });
    }

    this.updateObject = function(collection, objectid, update, onsuccess, onerror, context) {
        xhr("PUT", "http2mdb/" + collection + "/" + objectid, update, function(xmlhttp) {
            // we assume the response body to keep the the number of updated objects in the db
            var updates = parseInt(xmlhttp.responseText);
            // call the callback
            onsuccess(updates > 0, context);
        }, function(xmlhttp) {
            onerror(xmlhttp, context);
        });
    }

    this.deleteObject = function(collection, objectid, onsuccess, onerror, context) {
        xhr("DELETE", "http2mdb/" + collection + "/" + objectid, null, function(xmlhttp) {
            // we assume the response body to keep the the number of updated objects in the db
            var updates = parseInt(xmlhttp.responseText);
            // call the callback
            onsuccess(updates > 0, context);
        }, function(xmlhttp) {
            onerror(xmlhttp, context);
        });
    }
}
