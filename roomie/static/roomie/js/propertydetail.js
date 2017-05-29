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
			slideGroups.push(group);
			group = [];
			group.push(all_floor_plan[i]);
		}
		if(i == all_floor_plan.length - 1) {
			slideGroups.push(group);
			group = []
		}
	}
	for(var i=0; i < slideGroups[0].length; i++) {
		slideGroups[0][i].style.display = "";
	}
	console.log(slideGroups[0][0]);
}

function floorplanSlideshow() {
	$("#right-btn").click(function() {
		console.log("right-btn clicked");
		for(var i=0; i < slideGroups[currentShow].length; i++) {
			slideGroups[currentShow][i].style.display = "none";
		}
		if(currentShow == slideGroups.length - 1) currentShow = 0;
		else currentShow++;
		for(var j=0; j < slideGroups[currentShow].length; j++) {
			slideGroups[currentShow][j].style.display = "";
		}
	});
	$("#left-btn").click(function() {
		console.log("left-btn clicked");
		for(var i=0; i < slideGroups[currentShow].length; i++) {
			slideGroups[currentShow][i].style.display = "none";
		}
		if(currentShow == 0) currentShow = slideGroups.length - 1;
		else currentShow--;
		for(var j=0; j < slideGroups[currentShow].length; j++) {
			slideGroups[currentShow][j].style.display = "";
		}
	});
}

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
	floorplanSlide();
	floorplanSlideshow();
	likeProperty();
	initAutocomplete();
});