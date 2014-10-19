var status = 0;
var running = true;

// implement the process to be executed by the worker 
function work(factor) {
    for (;running && status<factor*100000000;status++) {
    	if (status % 100000 == 0) {
    	   	self.postMessage(status/100000);
    	}
    }		
	self.postMessage("done");
}

// handle the start event, reading out parameters from the event object
onmessage = function(event) {  
	work(event.data);
};  
