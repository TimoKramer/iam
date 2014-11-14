
function loadContentAndCreateLayout() {

    console.log("loadContentAndCreateLayout()");
    
    objekt = document.getElementById("objekt");
    zeitfragment = document.getElementById("zeitfragment");
    objekt.parentNode.removeChild(objekt);
    zeitfragment.parentNode.removeChild(zeitfragment);
    
    xhr("GET", "/data/uebungen/ue2_1.json", null, function(xmlhttp) {
        var jsonContent = JSON.parse(xmlhttp.responseText);

        setTitle(jsonContent.title);

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
    document.getElementById("topic_title").textContent = title;
}

function createObjekt(contentItem) {
    console.log("creating Objekt");
    
    // in case of using different configs
    var render_article = contentItem.render_container;
    
    // creating objekt
   	document.querySelector("#left").appendChild(objekt);
    document.querySelector("#left").setAttribute("id", "objekt");  
    document.querySelector("#objekt_figure img").setAttribute("src", contentItem.src);
    img_description = contentItem.description;
    
}

function createTextauszug(contentItem) {
    console.log("creating Textauszug");
	
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
    console.log("creating Medienverweis");

	var render_article = contentItem.render_container;
	// set id=medienverweis to the article of the render_container
    if(!document.getElementById("medienverweise")){
    	document.querySelector("#"+render_article).setAttribute("id", "medienverweise");
	}

    var medienverweise = document.getElementById("medienverweise");
    
    // new medienverweis
    var new_mv = document.createElement("div");
    new_mv.className = "medienverweis";
    // title
    new_mv.appendChild(document.createElement("h2")).textContent=contentItem.title;
    // list
    var ul = document.createElement("ul");
    new_mv.appendChild(ul);
    // add the div as medienverweis
    medienverweise.appendChild(new_mv);
	
    // then iterate over the list of links that is contained in the contentItem object
    for (var i = 0; i < contentItem.content.length; i++) {
    	// list item
        li = document.createElement("li");
        // link
        a = document.createElement("a");
        li.appendChild(a);
        // reference
        a.href = contentItem.content[i].src;
        // content
        a.textContent = contentItem.content[i].title;
        ul.appendChild(li);
    }
}
