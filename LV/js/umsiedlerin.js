
//Save the root element
var viewRoot;
var foot;

function initView(){
	
	//initialization of root element
	viewRoot = document.getElementsByTagName("section")[0];
	foot = document.getElementsByTagName("footer")[0];
	
	//initialization of fullcontent_link class elements
	var fullcontent_link = document.getElementsByClassName("fullcontent_link")[0];
	
	//initialization of backlink element
	var backlink = document.getElementById("backlink");

	
	//click action on fullcontent_link change to detailview
	fullcontent_link.onclick = function(event){
		event.stopPropagation();
		viewRoot.classList.toggle("faded");
		foot.classList.toggle("faded");
		setTimeout( function(){
			toggleDetailView("textauszug");
			viewRoot.classList.toggle("faded");
			foot.classList.toggle("faded");
		},2000);
		
	};
	
	//click action on backlink change back if detailview not set
	backlink.onclick = function(event){
		event.stopPropagation();
		if(viewRoot.classList.contains("detailview")){
			viewRoot.classList.toggle("faded");
			foot.classList.toggle("faded");
			setTimeout( function(){
				toggleDetailView("textauszug");
				viewRoot.classList.toggle("faded");
				foot.classList.toggle("faded");
			},2000);
		}
	};
	
	
	//Show image description by clicking objekt_img
	var objekt_img = document.getElementById("objekt_img");
	objekt_img.onclick = function(event){
		event.stopPropagation();
		alert(img_description);
	};
}

//function for change/toggle between detail and main view
function toggleDetailView(elementname){
	viewRoot.classList.toggle("detailview");
	viewRoot.classList.toggle("detailview-"+elementname);
	foot.classList.toggle("detailview");
}



