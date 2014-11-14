
//Save the root element
var root;
var foot;

function initView(){
	
	//initialization of root element
	root = document.getElementsByTagName("section")[0];
	foot = document.getElementsByTagName("footer")[0];
	
	//initialization of fullcontent_link class elements
	var fullcontent_link = document.getElementsByClassName("fullcontent_link")[0];
	
	var zurueck = document.getElementById("zurueck");

	// show detailview of zeitfragment
	fullcontent_link.onclick = function(event){
		event.stopPropagation();
		root.classList.toggle("fadeout");
		foot.classList.toggle("fadeout");
		setTimeout( function(){
			root.classList.toggle("fadeout");
			foot.classList.toggle("fadeout");
			toggleDetailView("textauszug");
		},2000);
		
	};
	
	// show main page
	zurueck.onclick = function(event){
		event.stopPropagation();
		if(root.classList.contains("detailview")){
			root.classList.toggle("fadeout");
			foot.classList.toggle("fadeout");
			setTimeout( function(){
				root.classList.toggle("fadeout");
				foot.classList.toggle("fadeout");
				toggleDetailView("textauszug");
			},2000);
		}
	};
	
	// show image description // Anforderung 4 JSR2
	var objekt_img = document.getElementById("objekt_img");
	objekt_img.onclick = function(event){
		event.stopPropagation();
		alert(objekt_figure.getElementsByTagName("figcaption")[0].textContent);
	};
}

//function for change/toggle between detail and main view
function toggleDetailView(elementname){
	root.classList.toggle("detailview");
	root.classList.toggle("detailview-"+elementname);
	foot.classList.toggle("detailview");
}



