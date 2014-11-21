// add the functions in this script as a submodule to the iam module
// see http://stackoverflow.com/questions/7508905/how-to-make-a-submodule-via-module-pattern
var iam = (function(parentmodule) {

	console.log("loading sharedutils as submodule sharedutils of: " + parentmodule);

	/**
	 * @author Jörn Kreutel
	 */
	/*
	 * utility: remove all child elements from a node
	 */
	function clearNode(node) {
		while (node.firstChild) {
			console.log("removing child node: " + node.firstChild);
			node.removeChild(node.firstChild);
		}
	}

	/*
	 * utility treat null as empty string
	 */
	function nullAsEmptyString(val) {
		return (val == null ? "" : val);
	}

	/*
	 * some substring functionality
	 */
	function substringAfter(string, separator) {
		var split = string.split(separator);
		//console.log("split result is: " + split);
		var rest = "";
		for (var i = 1; i < split.length; i++) {
			if (i != 1) {
				rest += separator;
			}
			rest += split[i];
		}

		return rest;
	}

	function startsWith(string, substring) {
		return string.indexOf(substring) == 0;
	}

	function endsWith(string, substring) {
		if (!string || !substring) {
			return false;
		}
		return string.length >= substring.length && string.substring(string.length - substring.length) == substring;
	}

	// export the public functions as submodule to the porent module (in fact, currently these are all functions...)
	parentmodule.sharedutils = {

		clearNode : clearNode,
		nullAsEmptyString : nullAsEmptyString,
		substringAfter : substringAfter,
		startsWith : startsWith,
		endsWith : endsWith

	};

	return parentmodule;

})(iam || {});
