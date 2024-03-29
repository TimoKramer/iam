/*
 * taken from http://jmesnil.net/weblog/2010/11/24/html5-web-application-for-iphone-and-ipad-with-node-js/
 */

var http = require('http');
var url = require('url');
var fs = require('fs');
var sys = require('sys');

var utils = require("./njsimpl/njsutils");

var http2mdb = require("./njsimpl/http2mdb");

// the HTTP server
var server;
// the port on which the server will be started
var port = 8580;

// the ip address
var ip = utils.getIPAddress();

server = http.createServer(function(req, res) {
    var path = url.parse(req.url).pathname;

    console.log("http request callback: trying to serve path: " + path);

    // check whether we have an api call or need to serve a file
    if (path.indexOf("/http2mdb/") == 0) {
        console.log("http request callback: got a call to the http2mdb api. Will continue processing there...");
        http2mdb.processRequest(req, res);
    } 
    // this is for a client to verify whether the server is available
    else if (path.indexOf("/available") == 0) {
        console.log("http request callback: got availability check. Will respond 200");
        res.writeHead(200);
        res.write("available");
        res.end();   
    }    
    else {
        if (path == '/') {
            // if the root is accessed we serve the main html document
            path = "off.html";
        }
        // serveable resources will be put in the webcontent directory -- the callback will be passed the data read out from the file being accessed
        fs.readFile(__dirname + "/webcontent/" + path, function(err, data) {
            // check whether we have got an error retrieving the resource: create a 404 error, assuming that a wrong uri was used
            if (err) {
                console.log("http request callback: NOT FOUND: " + path);
                res.writeHead(404);
                res.end();
            }
            // otherwise create a 200 response and set the content type header
            else {
                var header = {
                    'Content-Type' : contentType(path)
                };               
                res.writeHead(200, header);
                res.write(data, 'utf8');
                res.end();
            }
        });
    }
    
    // // exception handling, see http://stackoverflow.com/questions/5999373/how-do-i-prevent-node-js-from-crashing-try-catch-doesnt-work
    // process.on("uncaughtException", function(error) {
        // console.log("http request callback: got an uncaught exception!");
        // console.log(error.stack);
        // if (res) {
            // console.log("http request callback: finishing response on error...");
            // res.writeHead(500);
            // res.end();
        // }
        // else {
            // console.log("http request callback: response is null. No need to finish...");
        // }
    // });
    
});

// let the server listen on the given port
server.listen(port, ip);
console.log("HTTP server running at http://" + ip + ":" + port);

/*
 * helper methhod for assiging a Content-Type header to http responses
 */
function contentType(path) {
    if (path.match('.js$')) {
        return "text/javascript";
    } else if (path.match('.css$')) {
        return "text/css";
    } else if (path.match('.json$')) {
        return "application/json";
    } else if (path.match('.css$')) {
        return "text/css";
    } else if (path.match('.png$')) {
        return "image/png";
    } else if (path.match('.jpg$')) {
        return "image/jpg";
    } else if (path.match('.ogv$')) {
        return "video/ogg";
    } else if (path.match('.ogg$')) {
        return "audio/ogg";
    } else if (path.match('.manifest$')) {
        return "text/cache-manifest";
    } else if (path.match('.webapp$')) {
        return "application/x-web-app-manifest+json";
    } else {
        return "text/html";
    }
}

