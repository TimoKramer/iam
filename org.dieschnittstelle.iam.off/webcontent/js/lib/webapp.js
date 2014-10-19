/**
 * @author Jörn Kreutel
 */

function checkWebappInstalled(appid) {
    var index = window.location.pathname.lastIndexOf("/");
    var webappid = window.location.origin + (index == -1 ? window.location.pathname : window.location.pathname.substring(0,index)) + "/" + appid;

    if (confirm("check whether webapp " + webappid + " is installed...")) {

        var request = navigator.mozApps.checkInstalled(webappid);

        request.onsuccess = function() {
            if (request.result) {
                console.log("the webapp has already been installed.");
                alert("The webapp has already been installed!");
            } else {
                console.log("the webapp has not been installed yet. Offer it...");
                if (confirm("Do you want to install this website as webapp?")) {
                    installWebapp(webappid);
                }
            }
        };
        request.onerror = function() {
            alert('Error checking installation status: ' + this.error.message);
        };
    }
}

function installWebapp(webappid) {
    console.log("will install webapp...");
    var installrequest = navigator.mozApps.install(webappid);
    installrequest.onsuccess = function() {
        alert("Installation successful!");
    };
    installrequest.onerror = function(err) {
        alert("Installation failed: " + JSON.stringify(err));
    };
}

