const PROPERTY_IMAGE_STATIC_URL = null;

function getProperty() {
	$.ajax({
		url: "/roomie/searchproperty_getresults",
		data: "csrfmiddlewaretoken="+getCSRFToken(),
		dataType: "json",
		success: updatePropertyList,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
     alert("some error");
  }
	});
}
function loadPropertyFromImage() {
	$(document).on("click", ".property-picture", function() {
		
		$(this).parent().find(".property-name").click();
		
	});
}
function appendProperty(pic, neighborhood, name, likes, price, sqft, csrf_token, id, if_liked) {
	
	
	$(".property-row").append(
				'<form method="get" action="'+property_detail_url+'/'+id+'">'+
				'<div class="column property-tile">'+
					'<img class="property-picture" src="'+pic+'" width="343px" height="220px">'+ //image of property
					'<!-- Name of the neighborhood and property -->'+
					'<div class="property-neighborhood">'+neighborhood+'</div>'+//neighborhood
					'<button type="submit" class="property-name">'+name+'</button>'+//property name here
					'<div class="row1 property-operation">'+
						'<!-- How many liked the property -->'+
						'<div class="column property-operation-sub" id="property-like">'+
							'<div class="property-operation-sub-text" id="property-like-text">'+likes+ ((likes=="0" || likes=="1") ? " LIKE" : " LIKES") + '</div>'+//how many likes
							(if_liked == "TRUE" ? '<img id="property-like-icon" src='+liked_icon_url+' width="28px" height="28px">' : '<img id="property-like-icon" src="'+like_icon_url+'" width="28px" height="28px">')+ //like icon
						'</div>'+
						'<!-- Price of the property -->'+
						'<div class="column property-operation-sub" id="property-price">'+
							'<div class="property-operation-sub-text" id="property-price-text">PRICE</div>'+
							'<div id="property-price-value">+$'+price.replace(".00","")+'/mo</div>'+ //price here, integer ONLY!
						'</div>'+
					
						'<!-- How many matches do you have for this property -->'+
						'<div class="column property-operation-sub" id="property-sqft">'+
							'<div class="property-operation-sub-text" id="property-sqft-text">SQ.FEET</div>'+
							'<div id="property-match-value">'+sqft+'</div>'+//area here, integer ONLY!
						'</div>'+
				'	</div>'+
				'</div>'+
				'<input type="hidden" name="csrfmiddlewaretoken" value="'+csrf_token+'">'+
				'<input type="hidden" name="propertyid" id="propertyid" value="'+id+'">'+
				'<input type="hidden" id="liked" value="'+if_liked+'">'+
				'</form>');
	if(if_liked == true) {

	}
}
//update property list
//django return property picture url, neighborhood name, property name, how many likes, price, sqft, property id, and if current user liked the property
function updatePropertyList(mylist) {
	$(".property-list").empty();
	console.log("remove properties");
	for(var i = 0; i < mylist.length; i++) {
		if(i % 3 == 0) {
			$(".property-list").append('<div class="row1 property-row"></div>');
			appendProperty(
				mylist[i].propertyPictureURL, 
				mylist[i].neighborhood, 
				mylist[i].name, 
				mylist[i].likes, 
				mylist[i].price, 
				mylist[i].sqft, 
				getCSRFToken(),
				mylist[i].id,
				mylist[i].if_liked);
		}
		else {
			appendProperty(
				mylist[i].propertyPictureURL, 
				mylist[i].neighborhood, 
				mylist[i].name, 
				mylist[i].likes, 
				mylist[i].price, 
				mylist[i].sqft, 
				getCSRFToken(),
				mylist[i].id,
				mylist[i].if_liked);
		}
	}
}
//if user clicks like, update database and interact
function likeProperty() {
	var if_liked = "FALSE";
	$(document).on("click", "#property-like-icon", function() {
		console.log("click");
		var property_id = $(this).parent().parent().parent().parent().find("#propertyid").val();
		if_liked = $(this).parent().parent().parent().parent().find("#liked").val();
		if(if_liked == "TRUE") {
			console.log("user choose to dislike the property");
			var currText = $(this).parent().find("#property-like-text").text();
			$(this).parent().find("#property-like-text").text(editDislikeText(currText));
			$(this).attr("src", like_icon_url);
			$(this).parent().parent().parent().parent().find("#liked").val("FALSE");
			if_liked = "FALSE";
		}
		else if(if_liked == "FALSE") {
			console.log("user choose to like the property");
			var currText = $(this).parent().find("#property-like-text").text();
			$(this).parent().find("#property-like-text").text(editLikeText(currText));
			$(this).attr("src", liked_icon_url);
			$(this).parent().parent().parent().parent().find("#liked").val("TRUE");
			if_liked = "TRUE";
		}
		$.ajax({
			url: "/roomie/updatelikedb", //update the database
			type: "POST",
			data: "property_id="+property_id+"&like="+if_liked+"&csrfmiddlewaretoken="+getCSRFToken(),
			dataType: "json",
			success: function() {}
		});
	});
	function editLikeText(text) {
		if(parseInt(text) == 0) return "1 LIKE";
		else return parseInt(text) + 1 + " LIKES"
	}
	function editDislikeText(text) {
		if(parseInt(text) - 1 <= 1) return parseInt(text) - 1 + " LIKE";
		else return parseInt(text) - 1 + " LIKES"
	}
}
function getCSRFToken() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].startsWith("csrftoken=")) {
            return cookies[i].substring("csrftoken=".length, cookies[i].length);
        }
    }
    return "unknown";
}
function searchProperty() {
	var text = null;
	$("#search-input").keypress(function(event) {
		if(event.which == 13) {
			text = $("#search-input").val();
			$.ajax({
				url: "/roomie/searchproperty_searchresults",
				type: "GET",
				data: "keyword="+text+"&csrfmiddlewaretoken="+getCSRFToken(),
				dataType: "json",
				success: updatePropertyList
			});
			$(this).val("");
		}
	});
}
$(document).ready(function() {
	getProperty();
	searchProperty();
	likeProperty();
	loadPropertyFromImage();
});

// $(".property-row").append(
// 				'<form method="post" action="">'+
// 				'<div class="column property-tile">'+
// 					'<img src="'+mylist[i].propertyPictureURL+'" width="343px" height="220px">'+ //image of property
// 					'<!-- Name of the neighborhood and property -->'+
// 					'<div class="property-neighborhood">'+mylist[i].neighborhood+'</div>'+//neighborhood
// 					'<button type="submit" class="property-name">'+mylist[i].name+'</button>'+//property name here
// 					'<div class="row property-operation">'+
// 						'<!-- How many liked the property -->'+
// 						'<div class="column property-operation-sub" id="property-like">'+
// 							'<div class="property-operation-sub-text" id="property-like-text">'+mylist[i].likes+' LIKE</div>'+//how many likes
// 							'<img id="property-like-icon" src="images/like.svg" width="28px" height="28px">'+//like icon here
// 						'</div>'+
// 						'<!-- Price of the property -->'+
// 						'<div class="column property-operation-sub" id="property-price">'+
// 							'<div class="property-operation-sub-text" id="property-price-text">PRICE</div>'+
// 							'<div id="property-price-value">+$'+mylist[i].price+'/mo</div>'+ //price here, integer ONLY!
// 						'</div>'+
					
// 						'<!-- How many matches do you have for this property -->'+
// 						'<div class="column property-operation-sub" id="property-sqft">'+
// 							'<div class="property-operation-sub-text" id="property-sqft-text">SQ.FEET</div>'+
// 							'<div id="property-match-value">'+mylist[i].sqft+'</div>'+//area here, integer ONLY!
// 						'</div>'+
// 				'	</div>'+
// 				'</div>'+
// 				'<input type="hidden" name="csrfmiddlewaretoken" value="'+getCSRFToken()+'">'+
// 				'</form>');