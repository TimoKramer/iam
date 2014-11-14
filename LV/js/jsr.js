
var zeitfragment;
var img_description;
var mv = 1;

/*
 * Anforderung 2 JSR2
 * the following vars and functions serve for switching between different configs and shall be used for realising the jsr exercise
 */
var configs = ["/data/die_umsiedlerin.json", "/data/der_bau.json", "/data/uebungen/ue2_1.json", "/data/uebungen/ue2_2.json", "/data/uebungen/ue2_3.json"];
var currentConfigId = 0;

function switchJsonConfig() {
	if (currentConfigId < (configs.length - 1)) {
		currentConfigId = currentConfigId + 1;
		console.log("ConfigID " + currentConfigId);
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
	};
	
	loadContentAndCreateLayout();
}

function loadContentAndCreateLayout() {
	// displaying the current config
	var pathSegments = configs[currentConfigId].split("/");
	config_switch.textContent = pathSegments[pathSegments.length-1];

	// resetting the layout, setting all elements to hidden, first
	var zdgetter = document.getElementById("zeitdokumente");
	if (zdgetter) zdgetter.hidden = true;
	var etgetter = document.getElementById("einfuehrungstext");
	if (etgetter) etgetter.hidden = true;
	var vkgetter = document.getElementById("verknuepfungen");
	if (vkgetter) vkgetter.hidden = true;
	var ofgetter = document.getElementById("objekt");
	if (ofgetter) ofgetter.hidden = true;
	var zfgetter = document.getElementById("zeitfragment");
	if (zfgetter) zfgetter.hidden = true;
	console.log(zdgetter + etgetter + vkgetter + ofgetter + zfgetter);
	console.log("loadContentFromServer()");
    
	// using xhr from xhr.js to get data
	//xhr("GET", ((currentConfigId && configs) ? configs[currentConfigId] : "/data/die_umsiedlerin.json"), null, function(xmlhttp) {
    xhr("GET", "/data/uebungen/ue2_1.json", null, function(xmlhttp) {
        var jsonContent = JSON.parse(xmlhttp.responseText);

        // read out the title and set it
        setTitle(jsonContent.title);

        // log length of content_items
        console.log("length of content items loaded from server is: " + jsonContent.content_items.length);

        // now iterate over the items checking its type and calling the appropriate function for creating the content item
        for (var i = 0; i < jsonContent.content_items.length; i++) {
            var currentItem = jsonContent.content_items[i];
            // log the item type
            console.log("type of item is: " + currentItem.type);
            switch (currentItem.type) {
                case "objekt":
                    createObjekt(currentItem);
                    break;
                case "textauszug":
                    createTextauszug(currentItem);
                    break;
                case "medienverweise":
                    createMedienverweis(currentItem);
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


function createObjekt(contentItem) {    
	
	console.log("creating Objekt");
	
	document.getElementById(contentItem.render_container).appendChild(document.getElementById('objekt'));
	document.querySelector("#objekt_figure img").setAttribute("src", contentItem.src);
	objekt_figure.getElementsByTagName("figcaption")[0].textContent = contentItem.description;
    objekt.hidden = false;
}


function createTextauszug(contentItem) {
    
    console.log("creating Textauszug");
	
	document.querySelector("")
	
	// create the zeitfragment from template and set id=textauszug to the article of the render_container
    var render_article = contentItem.render_container;
    document.querySelector("#"+render_article).appendChild(zeitfragment);
    document.querySelector("#"+render_article).setAttribute("id", "textauszug");
    
    // the content will be provided by a server-side html file which we set as innerHTML in the local attachment site (the div element marked as "contentfragment")
    xhr("GET", contentItem.src, null, function(xmlhttp) {
        console.log("received response for textauszug");
        document.querySelector("#textauszug .contentfragment").innerHTML = xmlhttp.responseText;
    });
}


function createMedienverweis(contentItem) {
    console.log("createMedienverweis()");
	
	var render_article = contentItem.render_container;
	// set id=medienverweis to the article of the render_container
    if(mv==1){
    	document.querySelector("#"+render_article).setAttribute("id", "medienverweise");
	}
	
	//marker for medienverweis article is allready set
	mv = 2;
	
    // we read out the list element
    var medienverweise = document.getElementById("medienverweise");
    
    // create a div as medienverweisfragment
    var new_mfragment = document.createElement( "div" );
    new_mfragment.className = "medienverweisfragment";
    
    //add the titel of medienverweisfragment
    var new_title = document.createElement( "h2" );
    new_title.textContent = contentItem.title;
    new_mfragment.appendChild(new_title);
    
    // create an ul list
    var ul = document.createElement("ul");
    new_mfragment.appendChild(ul);
  
    // add the div as medienverweisfragment
    medienverweise.appendChild(new_mfragment);
	
    // then iterate over the list of links that is contained in the contentItem object
    for (var i = 0; i < contentItem.content.length; i++) {
    	
       
        // create a li element
        li = document.createElement("li");
        // create an a element and add it as a child to li
        a = document.createElement("a");
        li.appendChild(a);
        // set the target from the current list element as href
        a.href = contentItem.content[i].src;
 
        // and set the title as textContent
        a.textContent = contentItem.content[i].title;

        // append the complete li element as child to ul
        ul.appendChild(li);
    }

}
