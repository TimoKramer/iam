
var objektfragment;
var zeitfragment;
var img_description;
var mv = 1;

function loadContentAndCreateLayout() {

    console.log("loadContentAndCreateLayout()");
    
    objektfragment = document.getElementById("objektfragment");
    zeitfragment = document.getElementById("zeitfragment");
    objektfragment.parentNode.removeChild(objektfragment);
    zeitfragment.parentNode.removeChild(zeitfragment);
    
	// using xhr from xhr.js to get data	
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
    console.log("createObjekt()");
    
    // create the objektfragment from template and set id=objekt to the article of the render_container
    var render_article = contentItem.render_container;
   	document.querySelector("#"+render_article).appendChild(objektfragment);
    document.querySelector("#"+render_article).setAttribute("id", "objekt");  
    
    // we set the src attribute of the img
    document.querySelector("#objekt_figure img").setAttribute("src", contentItem.src);
    // ... and the caption
  //  document.getElementById("objekt").getElementsByTagName("figcaption")[0].textContent = contentItem.description;
    img_description = contentItem.description;
    
}


function createTextauszug(contentItem) {
    console.log("createTextauszug()");
	
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
