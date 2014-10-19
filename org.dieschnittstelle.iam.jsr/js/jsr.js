/**
 * @author Jörn Kreutel
 */

/*
 * the following vars and functions serve for switching between different configs and shall be used for realising the jsr exercise
 */
var configs = ["/data/die_umsiedlerin.json", "/data/der_bau.json", "/data/uebungen/ue2_1.json", "/data/uebungen/ue2_2.json", "/data/uebungen/ue2_3.json"];
var currentConfigId = 0;

function switchJsonConfig() {
	if (currentConfigId < (configs.length - 1)) {
		currentConfigId = currentConfigId + 1;
	} else {
		currentConfigId = 0;
	}
}

var config_switch;

/*
 * this functions loads the content given the selected config
 */
function initialiseView() {

	// set the switch function as onlick on the config_switch element and display the config
	config_switch = document.getElementById("config_switch");
	config_switch.onclick = function() {
		switchJsonConfig();
		loadContentAndCreateLayout();
	}
	
	loadContentAndCreateLayout();
}

function loadContentAndCreateLayout() {
	// we display the current config
	var pathSegments = configs[currentConfigId].split("/");
	config_switch.textContent = pathSegments[pathSegments.length-1];

	// we reset the layout, setting all elements to hidden, first
	document.getElementById("zeitdokumente").hidden = true;
	document.getElementById("einfuehrungstext").hidden = true;
	document.getElementById("verknuepfungen").hidden = true;

	console.log("loadContentFromServer()");

	// we load the json data that contains the content that will be used to populate the view elements
	xhr("GET", ((currentConfigId && configs) ? configs[currentConfigId] : "/data/die_umsiedlerin.json"), null, function(xmlhttp) {
		// we read out the textual content from the response, parsing it as json -- try out with
		var textContent = xmlhttp.responseText;
		console.log("responseText from server is: " + textContent);
		var jsonContent = JSON.parse(textContent);
		console.log("responseText as json object is: " + jsonContent);

		// we read out the title and set it
		setTitle(jsonContent.title);

		// the content is a list of json objects. log its length
		console.log("length of content items loaded from server is: " + jsonContent.content_items.length);

		// now iterate over the items checking its type and calling the appropriate function for creating the content item
		for (var i = 0; i < jsonContent.content_items.length; i++) {
			var currentItem = jsonContent.content_items[i];
			// log the item type
			console.log("type of item is: " + currentItem.type);
			switch (currentItem.type) {
				case "zeitdokumente":
					createZeitdokumente(currentItem);
					break;
				case "einfuehrungstext":
					createEinfuehrungstext(currentItem);
					break;
				case "verknuepfungen":
					createVerknuepfungen(currentItem);
					break;
				default:
					console.log("cannot handle item type: " + currentItem.type + ". Ignore for the time being...");
			}
		}
	});

}

function setTitle(title) {
	console.log("setTitle(): " + title);
	document.getElementById("topic_title").textContent = title;
}

/*
 * the following functions demontrate different ways to access dom elements for manipulation
 */

function createZeitdokumente(contentItem) {
	console.log("createZeitdokumente()");
	var zeitdokumente = document.getElementById("zeitdokumente");
	// set hidden to false
	zeitdokumente.hidden = false;
	// we set the src attribute of the img
	document.querySelector("#zeitdokumente img").setAttribute("src", contentItem.src);
	// ... and the caption
	zeitdokumente.getElementsByTagName("figcaption")[0].textContent = contentItem.title;
}

function createEinfuehrungstext(contentItem) {
	console.log("createEinfuehrungstext()");
	var einfuehrungstext = document.getElementById("einfuehrungstext");
	einfuehrungstext.hidden = false;

	// the content will be provided by a server-side html file which we set as innerHTML in the local attachment site (the div element marked as "contentfragment")
	xhr("GET", contentItem.src, null, function(xmlhttp) {
		console.log("received response for textauszug");
		document.querySelector("#einfuehrungstext .contentfragment").innerHTML = xmlhttp.responseText;
	});
}

/* here, we demonstrate how to create an element from scratch using the dom api (rather than concatenating a string that might be set as innerHTML as the content above) */
function createVerknuepfungen(contentItem) {
	console.log("createVerknuepfungen()");
	var verknuepfungen = document.getElementById("verknuepfungen");
	verknuepfungen.hidden = false;

	// we read out the list element
	var ul = verknuepfungen.querySelector("ul");
	console.log("found ul: " + ul);

	// we clear the element which might contain child elements: 'as long as a firstChild can be found underneath of the element, we remove it'
	while (ul.firstChild) {
		ul.removeChild(ul.firstChild);
	}

	// then iterate over the list of links that is contained in the contentItem object
	for (var i = 0; i < contentItem.content.length; i++) {
		// show the stepwise rendering of the elements
		// create a li element
		li = document.createElement("li");
		// create an a element and add it as a child to li
		a = document.createElement("a");
		li.appendChild(a);
		// set the target from the current list element as href
		a.href = contentItem.content[i].target;
		// and set the title as textContent
		a.textContent = contentItem.content[i].title;

		// append the complete li element as child to ul
		ul.appendChild(li);
	}

}

