var iam = (function(parentmodule) {

	console.log("loading uiutils as submodule uiutils of: " + parentmodule);

	// a callback that will be called once a longpress occurs (note that this is a simplified implementation as for each document there will only be a single callback)
	var onlongpressCallback;

	/*************
	 * toasts
	 *************/

	function showToast(text) {
		console.log("showToast()");

		// access the toast element
		var toast = document.querySelector(".toast");
		// set the current time on the toast
		var currenttime = new Date();
		toast.textContent = text;
		toast.classList.toggle("active");
		setTimeout(function() {
			toast.classList.toggle("active");
		}, 3500);
	}

	/*************
	 * longpress
	 *************/

	/* the constants for longpress */
	// we create the functions to be called
	function startReco(event) {
		startLongpressReco(this, 1000, event);
	}

	function cancelReco(event) {
		cancelLongpressReco();
	}

	/* enable longpress on an element */
	function enableLongpress(element, callback) {
		// set the callback
		onlongpressCallback = callback;

		console.log("enabling longpress on: " + element);
		// set the function as arguments
		element.addEventListener("mousedown", startReco);
		element.addEventListener("touchstart", startReco);

		element.addEventListener("mouseup", cancelReco);
		element.addEventListener("mousemove", cancelReco);

		element.addEventListener("mousemove", cancelReco);
		element.addEventListener("touchmove", cancelReco);

		console.log("have set longpress handlers on element: " + element);
	}

	// we use a timer variable to detect whether we had a longpress
	var timer;

	function startLongpressReco(element, timeout, event) {
		console.log("startLongpressReco(): " + event);
		// we block propagation
		event.stopPropagation();
		// then we set the timeout for calling longPress handling
		timer = window.setTimeout(function() {
			// we invoke this function that must be provided by the view that uses the longpress handler - i.e. it is a global callback function with a fixed name
			if (onlongpressCallback) {
				console.log("detected longpress! Run callback function...");
				onlongpressCallback(element);
			} else {
				showToast("longpress occurred!");
			}
		}, timeout);
	}

	function cancelLongpressReco() {
		if (timer) {
			console.log("cancelLongpressReco()");
			window.clearTimeout(timer);
			timer = null;
		}
	}

	/***************
	 * ui utilities
	 ***************/

	/*
	 * cut and paste elements
	 */
	function cutNpasteElementByClassName(klass, target, insertBeforeId) {
		return this.cutNpasteElement(document.getElementsByClassName(klass)[0], target, insertBeforeId);
	}

	function cutNpasteElementById(id, target, insertBeforeId) {
		return this.cutNpasteElement(document.getElementById(id), target, insertBeforeId);
	}

	function cutNpasteElement(element, target, insertBeforeId) {
		if (!insertBeforeId) {
			target.appendChild(element);
		} else {
			target.insertBefore(element, document.getElementById(insertBeforeId));
		}

		return element;
	}

	// export the public functions as submodule to the porent module
	parentmodule.uiutils = {

		showToast : showToast,
		enableLongpress : enableLongpress,
		cutNpasteElementByClassName : cutNpasteElementByClassName,
		cutNpasteElementById : cutNpasteElementById,
		cutNpasteElement : cutNpasteElement

	}

	// return the parentmodule that now contains the submodule
	return parentmodule;

})(iam || {});

