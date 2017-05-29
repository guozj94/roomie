var currentShowFloorplan = 0;
var slideGroupsFloorplan = []
var currentShowRoomie = 0;
var slideGroupsRoomie = []
var currentShow = 0;
var slideGroups = [];
var if_liked;
var property_id;


function showLikeButton() {
	var likeButton = $("#if_liked");
	var if_liked = likeButton.val();
	if(if_liked == "FALSE") {
		$("#property-like-icon").attr("src", like_icon_url);
	}
	else if(if_liked == "TRUE") {
		$("#property-like-icon").attr("src", liked_icon_url);
	}
}

function likeProperty() {
	if_liked = $("#if_liked").val();
	property_id = $("#propertyid").val();
	$(document).on("click", "#property-like-icon", function() {
		if(if_liked == "TRUE") {
			console.log("user choose to dislike the property");
			$(this).attr("src", like_icon_url);
			if_liked = "FALSE";
		}
		else if(if_liked == "FALSE") {
			console.log("user choose to like the property");
			$(this).attr("src", liked_icon_url);
			if_liked = "TRUE";
		}
		$("#if_liked").val(if_liked);
		$.ajax({
			url: "/roomie/updatelikedb", //update the database
			type: "POST",
			data: "property_id="+property_id+"&like="+if_liked+"&csrfmiddlewaretoken="+getCSRFToken(),
			dataType: "json",
			success: function() {}
		});
	});
}

function floorplanSlide() {
	var all_floor_plan = $(".tile");
	if(all_floor_plan.length <= 3) {
		$("#left-btn").css("display", "none");
		$("#right-btn").css("display", "none");
		return 0;
	}
	var count = 0;
	var group = [];
	for(var i=0; i < all_floor_plan.length; i++) {
		all_floor_plan[i].style.display = "none";
		if(group.length < 3) {
			group.push(all_floor_plan[i]);
		}
		else {
			slideGroupsFloorplan.push(group);
			group = [];
			group.push(all_floor_plan[i]);
		}
		if(i == all_floor_plan.length - 1) {
			slideGroupsFloorplan.push(group);
			group = []
		}
	}
	for(var i=0; i < slideGroupsFloorplan[0].length; i++) {
		slideGroupsFloorplan[0][i].style.display = "";
	}
	console.log(slideGroupsFloorplan[0][0]);
}

function floorplanSlideshow() {
	$("#right-btn").click(function() {
		console.log("right-btn clicked");
		for(var i=0; i < slideGroupsFloorplan[currentShowFloorplan].length; i++) {
			slideGroupsFloorplan[currentShowFloorplan][i].style.display = "none";
		}
		if(currentShowFloorplan == slideGroupsFloorplan.length - 1) currentShowFloorplan = 0;
		else currentShowFloorplan++;
		for(var j=0; j < slideGroupsFloorplan[currentShowFloorplan].length; j++) {
			slideGroupsFloorplan[currentShowFloorplan][j].style.display = "";
		}
	});
	$("#left-btn").click(function() {
		console.log("left-btn clicked");
		for(var i=0; i < slideGroupsFloorplan[currentShowFloorplan].length; i++) {
			slideGroupsFloorplan[currentShowFloorplan][i].style.display = "none";
		}
		if(currentShowFloorplan == 0) currentShowFloorplan = slideGroupsFloorplan.length - 1;
		else currentShowFloorplan--;
		for(var j=0; j < slideGroupsFloorplan[currentShowFloorplan].length; j++) {
			slideGroupsFloorplan[currentShowFloorplan][j].style.display = "";
		}
	});
}
function roomieSlide() {
	var all_roomie = $(".roomie");
	if(all_roomie.length <= 2) {
		$("#left-btn").css("display", "none");
		$("#right-btn").css("display", "none");
		return 0;
	}
	var count = 0;
	var group = [];
	for(var i=0; i < all_roomie.length; i++) {
		all_roomie[i].style.display = "none";
		if(group.length < 2) {
			group.push(all_roomie[i]);
		}
		else {
			slideGroupsRoomie.push(group);
			group = [];
			group.push(all_roomie[i]);
		}
		if(i == all_roomie.length - 1) {
			slideGroupsRoomie.push(group);
			group = []
		}
	}
	for(var i=0; i < slideGroupsRoomie[0].length; i++) {
		slideGroupsRoomie[0][i].style.display = "";
	}
	console.log(slideGroupsRoomie[0][0]);
}

function roomieSlideshow() {
	$("#roomie-right-btn").click(function() {
		console.log("right-btn clicked");
		for(var i=0; i < slideGroupsRoomie[currentShowRoomie].length; i++) {
			slideGroupsRoomie[currentShowRoomie][i].style.display = "none";
		}
		if(currentShowRoomie == slideGroupsRoomie.length - 1) currentShowRoomie = 0;
		else currentShowRoomie++;
		for(var j=0; j < slideGroupsRoomie[currentShowRoomie].length; j++) {
			slideGroupsRoomie[currentShowRoomie][j].style.display = "";
		}
	});
	$("#roomie-left-btn").click(function() {
		console.log("left-btn clicked");
		for(var i=0; i < slideGroupsRoomie[currentShowRoomie].length; i++) {
			slideGroupsRoomie[currentShowRoomie][i].style.display = "none";
		}
		if(currentShowRoomie == 0) currentShowRoomie = slideGroupsRoomie.length - 1;
		else currentShowRoomie--;
		for(var j=0; j < slideGroupsRoomie[currentShowRoomie].length; j++) {
			slideGroupsRoomie[currentShowRoomie][j].style.display = "";
		}
	});
}


function likeRoomates() {
    $(document).on("click", ".like-button", function() {
    	property_id = $("#propertyid").val();
        var liked_user = $(this).parent().parent().find("#liked_user_id");
        var liked_user_id = liked_user.val();
        var roomie = $(this).parent().parent();
        displaytonone(roomie);

        // roomie.prop('disabled', true);

        $.ajax({
            url: "/roomie/likedpropertydetail_json",
            type: "POST",
            data: "liked_user_id="+liked_user_id+"&propertyid="+property_id+"&csrfmiddlewaretoken="+getCSRFToken(),
            dataType : "json",
            success: function(response) {
            },
			error: function(XMLHttpRequest, textStatus, errorThrown) {
	     		//alert("some error");
	  		}
        });
    });
}
/* set display to hidden */
function displaytonone(element) {
	element.addClass("displaynone");
}

	/* set display to true */
function displaytotrue(element) {
	element.removeClass("displaynone");
}


function dislikeRoomates() {
    $(document).on("click", ".dislike-button", function() {
        var disliked_user = $(this).parent().parent().find("#liked_user_id");
        var disliked_user_id = disliked_user.val()   
        var roomie = $(this).parent().parent();
        displaytonone(roomie);
        // roomie.prop('disabled', true);

        $.ajax({
            url: "/roomie/likedpropertydetail_json",
            type: "POST",
            data: "disliked_user_id="+disliked_user_id+"&propertyid="+property_id+"&csrfmiddlewaretoken="+getCSRFToken(),
            dataType : "json",
            success: function(response) {
            },
			error: function(XMLHttpRequest, textStatus, errorThrown) {
	     		alert("some error");
	  		}
        });
    });
}


function likeGroup() {
    $(document).on("click", ".group-like-button", function() {
        var roomie_group = $(this).parent().parent().find("#roomie_group_id");
        var roomie_group_id = roomie_group.val()   
        var roomie_group_all = $(this).parent().parent();
        displaytonone(roomie_group_all);

        // roomie.prop('disabled', true);

        $.ajax({
            url: "/roomie/likedpropertydetail_json",
            type: "POST",
            data: "liked_roomie_group_id="+roomie_group_id+"&propertyid="+property_id+"&csrfmiddlewaretoken="+getCSRFToken(),
            dataType : "json",
            success: function(response) {
            },
			error: function(XMLHttpRequest, textStatus, errorThrown) {
	     		alert("some error");
	  		}
        });
    });
}


function dislikeGroup() {
    $(document).on("click", ".group-dislike-button", function() {
        var roomie_group = $(this).parent().parent().find("#roomie_group_id");
        var roomie_group_id = roomie_group.val()   
        var roomie_group_all = $(this).parent().parent();
        displaytonone(roomie_group_all);

        // roomie.prop('disabled', true);

        $.ajax({
            url: "/roomie/likedpropertydetail_json",
            type: "POST",
            data: "disliked_roomie_group_id="+roomie_group_id+"&propertyid="+property_id+"&csrfmiddlewaretoken="+getCSRFToken(),
            dataType : "json",
            success: function(response) {
            },
			error: function(XMLHttpRequest, textStatus, errorThrown) {
	     		alert("some error");
	  		}
        });
    });
}



function updatePosRoomates(posRoomateList) {
	$(".roomie").empty();
	console.log("remove all roomie");
	
}


function roomie_filter() {
    $(document).on("click", ".roomie-filter", function() {
        console.log('hello, i am testing');
        var filter_value = $(this).text();
        var filter_type = $(this).parent().parent().find(".filter-type");
        console.log(filter_type.val());
        if (filter_type.val() ==  "filter_gender"){
		    hidden_filter = $(this).parent().parent().parent().parent().find("#filter_gender");	
	        hidden_filter.val(filter_value);
        }
        if (filter_type.val() ==  "filter_nationality"){
		    hidden_filter = $(this).parent().parent().parent().parent().find("#filter_nationality");	
	        hidden_filter.val(filter_value);
        }

        var filter_submit = $("#filter-submit-btn");
        filter_submit.click();
    });
}


// function appendPosRoomie(user_id, first_name, last_name, gender, program, nationality, tags, csrf_token) {
// 	$(".property-row").append(
// 				'<div class="column roomie">' +
// 					'<div class="roomie-name">' + first_name + '</div>' +
// 					'<div class="roomie-connection">' + gender + ',' + nationality + '</div>' +
// 					'<div class="row roomie-image">' +
// 						'<img src=\/roomie\/picture\/' + user_id + ' width="150px" height="150px">' +
// 					'</div>' +
// 					'<div class="row tags">' +
// 						'<div>' + tags + '</div>' +
// 					'</div>' +
// 					'<div class="row like-or-pass">' +
// 						'<input type="image" class="dislike-button" src="..\/img\/pass.svg\'" width="62px" height="84px" />' +
// 						'<input type="image" class="like-button" src="..\/img\/like-roomie.svg" width="62px" height="84px" />' +
// 					'</div>' +
// 				'</div>'
// }
//update property list
//django return property picture url, neighborhood name, property name, how many likes, price, sqft, property id, and if current user liked the property
// function updatePosRoomates(posRoomateList) {
// 	$(".roomie").empty();
// 	console.log("remove all roomie");
// 	for(var i = 0; i < posRoomateList.length; i++) {
// 			appendPosRoomie(
// 				posRoomateList[i].id,
// 				posRoomateList[i].first_name,
// 				posRoomateList[i].last_name, 
// 				posRoomateList[i].gender, 
// 				posRoomateList[i].program, 
// 				posRoomateList[i].nationality, 
// 				posRoomateList[i].tags, 
// 				getCSRFToken());
// 		}
// 	}
// }
// //if user clicks like, update database and interact
// function likeProperty() {
// 	var if_liked = "FALSE";
// 	$("#property-like").click(function() {
// 		var property_id = $(this).parent().parent().parent().find("#propertyid").val();
// 		if_liked = $(this).parent().parent().parent().find("#liked").val();
// 		if(if_liked == "TRUE") {
// 			$(this).find("img").attr("src", "images/like.svg");
// 			$(this).parent().parent().parent().find("#liked").val("FALSE");
// 			if_liked = "FALSE";
// 		}
// 		else if(if_liked == "FALSE") {
// 			$(this).find("img").attr("src", "images/liked.svg");
// 			$(this).parent().parent().parent().find("#liked").val("TRUE");
// 			if_liked = "TRUE";
// 		}
// 		$.ajax({
// 			url: "", //update the database
// 			type: "POST",
// 			data: "property_id="+property_id+"like="+if_liked+"&csrfmiddlewaretoken="+getCSRFToken(),
// 			dataType: "json",
// 			success: function() {}
// 		});
// 	});
// }

function getLocations() {
	var school = ['Carnegie Mellon', 40.444510, -79.942998];
	var xco = parseFloat($("#coordinates").val().split(",")[0]);
	var yco = parseFloat($("#coordinates").val().split(",")[1]);
	var property = [$(".property-name").text(), xco, yco];
	var locations = [property, school];
	return locations;
}
// var locations = [
// 	['Bakery Living Blue', xco, yco, 1],
//     ['Carnegie Mellon', 40.444510, -79.942998, 2],
// ];

function initAutocomplete() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.4445, lng: -79.9430},
		zoom: 12,
		mapTypeId: 'roadmap'
	});

	var markerDefault, i;
  	var infowindow = new google.maps.InfoWindow();
  	var locations = getLocations();

    for (i = 0; i < locations.length; i++) {
    	markerDefault = new google.maps.Marker({
        	position: new google.maps.LatLng(locations[i][1], locations[i][2]),
        	map: map,
        	//icon: i == 0 ? house : school
      	});
      	google.maps.event.addListener(markerDefault, 'click', (function(markerDefault, i) {
        	return function() {
          		infowindow.setContent(locations[i][0]);
         		infowindow.open(map, markerDefault);
        	}
      	})(markerDefault, i));
    }
       

  	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
  	var searchBox = new google.maps.places.SearchBox(input);
  	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  	// Bias the SearchBox results towards current map's viewport.
 	map.addListener('bounds_changed', function() {
    	searchBox.setBounds(map.getBounds());
  	});

  	var markers = [];
  	// Listen for the event fired when the user selects a prediction and retrieve
  	// more details for that place.
  	searchBox.addListener('places_changed', function() {
    	var places = searchBox.getPlaces();
    	if (places.length == 0) {
      		return;
   	 	}

   		// Clear out the old markers.
    	markers.forEach(function(marker) {
      	marker.setMap(null);
    	});
   		markers = [];

    	// For each place, get the icon, name and location.
    	var bounds = new google.maps.LatLngBounds();
    	places.forEach(function(place) {
      		if (!place.geometry) {
        	console.log("Returned place contains no geometry");
        	return;
      		}
      		var icon = {
        		url: place.icon,
        		size: new google.maps.Size(71, 71),
        		origin: new google.maps.Point(0, 0),
        		anchor: new google.maps.Point(17, 34),
        		scaledSize: new google.maps.Size(25, 25)
      		};

      		// Create a marker for each place.
      		markers.push(new google.maps.Marker({
        		map: map,
        		icon: icon,
        		title: place.name,
        		position: place.geometry.location
      		}));

      		if (place.geometry.viewport) {
        		// Only geocodes have viewport.
        		bounds.union(place.geometry.viewport);
      		} 
      		else {
        		bounds.extend(place.geometry.location);
      		}
    	});
    	map.fitBounds(bounds);
  	});
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



$(document).ready(function() {
	showLikeButton();
	likeProperty();
	floorplanSlide();
	floorplanSlideshow();
	roomieSlide();
	roomieSlideshow();
	likeRoomates();
	dislikeRoomates();
	likeGroup();
	dislikeGroup();
	roomie_filter();
	initAutocomplete();
});