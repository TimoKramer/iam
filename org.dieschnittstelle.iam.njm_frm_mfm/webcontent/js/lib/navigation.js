/**
 * @author Jörn Kreutel
 */

// add the functions in this script as a submodule to the iam module
// see http://stackoverflow.com/questions/7508905/how-to-make-a-submodule-via-module-pattern
var iam = (function(parentmodule) {

	console.log("loading navigation as submodule navigation of: " + JSON.stringify(parentmodule));
	/*
	 * we track the history length on loading a page
	 */
	var historyLengthOnLoad = window.history.length;
	console.log("historyLengthOnLoad: " + historyLengthOnLoad);

	/*
	 * change the view by setting the html document for the follow-up view and adding the arguments as a query string
	 */
	function nextView(uri, args) {
		console.log("about to access uri: " + uri);
		localStorage.setItem("previousView", window.location);
		window.location = uri + "?args=" + JSON.stringify(args);
	};

	/*
	 * go back to the previous view using the history
	 */
	function previousView() {
		var currentHistoryLength = window.history.length;

		// the comparison of current length to length on load succeeds in most cases, but not always (need to investigate further, problems occur when using the tab view) - use sessionStorage instead, but note that this will push a new element to the history rather than popping of elements from it
		console.log("previousView(): history length is: " + currentHistoryLength + "/" + historyLengthOnLoad);
		// we need to go one step further back than behind the beginning
		var step = (currentHistoryLength - historyLengthOnLoad) + 1;
		console.log("previousView(): going back " + step + " views...");
		//history.go(-step);
		var previousView = localStorage.getItem("previousView");

		// note that this solution will append the history:
		if (previousView) {
			console.log("previousView(): going back to previousView fro session storage: " + previousView);
			window.location = previousView;
		} else {
			console.log("previousView(): no previousView specified in session storage. Going back one step in history.");
			history.go(-1);
		}
	};

	/*
	 * get the arguments that might have been passed when calling the view
	 */
	function getViewargs() {
		//console.log("getViewargs(): search string is: " + window.location.search);
		//var argstr = decodeURIComponent(window.location.search.substring("?args=".length));
		var argstr = localStorage.getItem("currentViewargs");
		var args = JSON.parse(argstr);

		return args;
	};

	/*
	 * show the topicview for some topicid (the topicview is the "overview" view that we have been working with so far)
	 */
	function loadTopicview(topicid, typed_overview_prefix) {
		console.log("loadTopicview(): " + topicid);

		nextView("topicview.html", {
			"topicid" : topicid
		});
	};

	// export the functions
	parentmodule.navigation = {

		nextView : nextView,
		previousView : previousView,
		getViewargs : getViewargs,
		loadTopicview : loadTopicview

	};

	// return the parentmodule that now contains the submodule
	return parentmodule;

})(iam || {});
