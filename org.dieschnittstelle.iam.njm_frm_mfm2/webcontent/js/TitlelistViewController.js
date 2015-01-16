/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading TitlelistViewContoller as submodule controller.titlelist of: " + iammodule);

	function TitlelistViewController() {

		this.loadTitlelist = function() {
			console.log("loadContent()");

			// fetch the static json content from the webapp
			iam.xhr.xhr("GET", "data/titlelist.json", null, function(xmlhttp) {
				// evaluate the body
				console.log("received response.");
				updateView.call(this,(eval("(" + xmlhttp.responseText + ")")));
			}.bind(this));

		}
		
		updateView = function(titlelist) {
			console.log("updateView(): titlelist is: " + titlelist);
			
			// get the contentview
			var contentview = document.getElementById("contentview");

			// create the list element - we will add it at the very end of processing the input data to avoid formatting for each new element
			var ul = document.createElement("ul");

			// we also initialise a list of alltopics
			var alltopics = new Array();

			// we iterate over the list of titles and create an li/a for each title
			for (var i = 0; i < titlelist.length; i++) {
				var currentTitle = titlelist[i].uri;
				console.log("got title: " + currentTitle);

				var li = document.createElement("li");
				ul.appendChild(li);
				var span = document.createElement("span");
				li.appendChild(span);
				var a = document.createElement("a");
				a.setAttribute("class", "title");
				span.appendChild(a);
				// this is the notation for "replace all" ("g" stands for "global")
				a.appendChild(document.createTextNode(iam.sharedutils.substringAfter(currentTitle, "#").replace(/_/g, " ")));
				a.href = /*currentTitle;*/"javascript:iam.navigation.loadTopicview(\'" + iam.sharedutils.substringAfter(currentTitle, "#") + "\')";

			}

			// append the list to the content view
			contentview.appendChild(ul);

			// then trigger formatting
			adjustFontsize();
		}
		function adjustFontsize() {
			doAdjustFontsizeToWidth("contentview", "title", 6, 40, 0.99);
		}

		function adjustFontsizeToWidth(containerId, spanClass, origFontsize) {
			doAdjustFontsizeToWidth(containerId, spanClass, origFontsize, 20, 0.97);
		}

		/*
		 * adapted from http://jbdes.net/dev/js/fontsize.html
		 */
		function doAdjustFontsizeToWidth(containerId, spanClass, origFontsize, margin, buffer) {
			console.log("adjustFontsizeToWidth(): " + containerId + "/" + spanClass + "/" + origFontsize + "/" + margin + "/" + buffer);

			var container = document.getElementById(containerId);
			console.log("container: " + sidebar);

			var sectionWidth = container.getBoundingClientRect().width - margin;
			console.log("container width considering margin: " + sectionWidth)

			var spans = container.getElementsByClassName(spanClass);

			for (var i = 0; i < spans.length; i++) {
				var spanWidth = spans[i].getBoundingClientRect().width;
				console.log("span width is: " + spanWidth);
				var factor = (sectionWidth / spanWidth);
				// console.log("factor is: " + factor);
				// to be on the safe side, we will add a buffer
				var newFontSize = factor * origFontsize * buffer;
				//console.log("newFontSize is: " + newFontSize);
				var newstyle = "font-size: " + newFontSize + "px; line-height: " + newFontSize / 1.2 + "px;"
				console.log("setting style: " + newstyle);
				spans[i].style = newstyle;
			}
		}

	}

	// a factory method
	function newInstance() {
		return new TitlelistViewController();
	}

	// export the factory method
	if (!iammodule.controller) {
		iammodule.controller = {
			titlelist : {
				newInstance : newInstance
			}
		}
	} else {
		iammodule.controller.titlelist = {
			newInstance : newInstance
		}
	}

	// return the module
	return iammodule;

})(iam || {});

