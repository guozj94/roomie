var selected_chat;
var last_chat;

/* set display to hidden */
function displaytonone(element) {
	element.addClass("displaynone");
}

/* set display to true */
function displaytotrue(element) {
	element.removeClass("displaynone");
}

/* get all contacts from server via ajax */
function getContacts() {
	$.ajax({
		url: "/roomie/chatroom_getcontacts",
		type: "GET",
		data: "csrfmiddlewaretoken="+getCSRFToken(),
		dataType: "json",
		success: updateContacts,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
     		alert("some error");
  		}
	});
}

/** update contact list on the left
* @param myList JSON object from server
* create property block if there is not one
* append contacts if the property block exists
**/
function updateContacts(myList) {
	if(myList.length==0) {
		if(window.confirm("You don't have any roommate match. Go and like someone!")) {
			window.location.href = "likedproperty"
		}
	}
	var last_property;
	$.each(myList, function() {
		if(last_property != this.propertyid) {
			last_property = this.propertyid;
			$("#contacts-container").append(
				'<div class="column contacts-in-one-property">'+
				'<div class="property-name">'+this.propertyname+'</div>'+
				'<input type="hidden" id="propertyid" name="propertyid" value="'+this.propertyid+'">'+
				'<div class="row1 avatar-container">'+
					'<input type="hidden" name="groupid" id="groupid" value="'+this.id+'">'+
				'</div>'+
			'</div>'
				);
		}
		else {
			$(".contacts-in-one-property").last().append(
				'<div class="row1 avatar-container">'+
					'<input type="hidden" name="groupid" id="groupid" value="'+this.id+'">'+
				'</div>'
				);
		}
		for(var i = 0; i < this.membersname.length; i++) {
			$(".avatar-container").last().append(
				'<div class="column contact">'+
					'<img src="/roomie/picture/'+this.membersid[i]+'" width="50px" height="50px">'+
					'<div class="contact-info">'+this.membersname[i]+'</div>'+
					'<input type="hidden" name="userid" value="'+this.membersid[i]+'">'+
				'</div>'
				);

		}
	});
}
/* get all chat from server via ajax */
function getChats() {
	$.ajax({
		url: "/roomie/chatroom_getchats",
		type: "GET",
		data: "groupid=" + selected_chat.find("#groupid").val() + "&csrfmiddlewaretoken="+getCSRFToken(),
		dataType: "json",
		success: updateChats,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
     		alert("some error");
  		}
	});
}

/* put chats into the container */
function updateChats(myList) {
	if(JSON.stringify(last_chat) == JSON.stringify(myList)) return;
	last_chat = myList;
	// console.log("updateChats called");
	// console.log(last_chat);
	// console.log(myList);
	$("#chat-content").empty();
	$.each(myList, function() {
		if(this.fields.user == this_user) {
			$("#chat-content").append(
				'<div class="row1 my-chat">' +
					'<div class="message">'+this.fields.text+'</div>' +
					'<img class="avatar-in-chat" src="/roomie/picture/'+this.fields.user+'" width="50px" height="50px">' +
				'</div>'
				);
		}
		else {
			$("#chat-content").append(
				'<div class="row1 a-chat">'+
					'<img class="avatar-in-chat" src="/roomie/picture/'+this.fields.user+'" width="50px" height="50px">'+
					'<div class="message">'+this.fields.text+'</div>'+
				'</div>'
				);
		}
	});
	$("#chat-content").scrollTop($("#chat-content")[0].scrollHeight);
}
function writeChat() {
	$("#text-input").keypress(function(event) {
		if(event.which == 13) {
			var text = $("#text-input").val();
			$.ajax({
				url: "/roomie/chatroom_writechat",
				type: "POST",
				data: "groupid=" + selected_chat.find("#groupid").val() +"&userid=" + this_user + "&text=" + text + "&csrfmiddlewaretoken="+getCSRFToken(),
				dataType: "json",
				success: function(response) {
					$("#text-input").val("");
					getChats();
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
     				alert("some error");
  				}
			});
		}
	});
}
/* display chat container and all corresponding chats */
function displayChat() {
	$(document).on("click", ".avatar-container", function() {
		var this_chat = $(this);
		if(selected_chat === undefined) { //no chat is selected
			selected_chat = this_chat;
			this_chat.css("background-color", "#34495e");
			this_chat.find(".contact-info").css("color", "white");
			displaytotrue($("#chat-functions div"));
			displaytotrue($("#chat-functions textarea"));
			$("#chat-functions").css("background-color", "white");
		}
		else if(selected_chat == this_chat) { //click the same chat
			return;
		}
		else { //click another chat
			selected_chat.css("background-color", "rgb(251,251,251)");
			selected_chat.find(".contact-info").css("color", "black");
			selected_chat = this_chat;
			this_chat.css("background-color", "#34495e");
			this_chat.find(".contact-info").css("color", "white");
		}
		console.log(selected_chat);
		/* THEN LOAD THE CHAT */
		
		/* Enable settings in this chat*/
		if(selected_chat) {
			displaySettings();
			settings();
			setInterval(getChats, 1000);
			writeChat();
			addRoomie();
			confirmRoomie();
		}

		/* Get chat information*/

	});
}

function displaySettings() { //display settings
	if(selected_chat === undefined) return;
	console.log("displaySettings");
	$(document).on("click", ".settings", function() {
		console.log(selected_chat);
		if(selected_chat === undefined) return;
		displaytonone($("#chat-container"));
		displaytotrue($("#settings-container"));
	});
}

function settings() { //edit and save settings
	if(selected_chat === undefined) return;
	var notification;
	var chat_id = selected_chat ? selected_chat.find("#groupid").val() : undefined;
	$(document).on("click", ".options", function(event) {
		$(this).children().css("background-color", "#c6c8ca");
		var option = $(event.target);
		option.css("background-color", "#ffa300");
		notification = option.text();
		console.log(option.text());
	});
	$(document).on("click", "#more-option", function() {
		displaytonone($("#more-option"));
		displaytotrue($(".more-option-row"));
		displaytotrue($("#less-option"));
	});
	$(document).on("click", "#less-option", function() {
		displaytonone($(".more-option-row"));
		displaytonone($("#less-option"));
		displaytotrue($("#more-option"));
	});
	$(document).on("click", ".more-option-row", function(event) {

	});
	/* send notification change if done is clicked
	* @param id the id of this chat, where id is in hidden field
	* @param notification notification 
	* success close settings page
	*/
	$(document).on("click", "#done", function() {
		$.ajax({
			url: "/roomie/chatroom_changenotification",
			type: "POST",
			data: "id="+chat_id+"&notification="+notification+"&csrfmiddlewaretoken="+getCSRFToken(),
			dataType: "json",
			success: function() {
				displaytotrue($("#chat-container"));
				displaytonone($("#settings-container"));
			}
		});
	});
	/* quit the chat if done is clicked
	* @param id the id of this chat, where id is in hidden field
	* success clear current selected_chat
	*/
	$(document).on("click", "#quit", function() {
		var propertyid = selected_chat.parent().find("#propertyid").val();
		$.ajax({
			url: "/roomie/chatroom_quitgroup",
			type: "POST",
			data: "groupid="+selected_chat.find("#groupid").val()+"&propertyid="+propertyid+"&csrfmiddlewaretoken="+getCSRFToken(),
			dataType: "json",
			success: function() {
				selected_chat = undefined;
				window.location.reload();
			}
		});
	});
}

function addRoomie() {
	$(document).on("click", "#add", function() {
		$.ajax({
			url: "/roomie/chatroom_addroomie",
			type: "POST",
			data: "groupid="+selected_chat.find("#groupid").val()+"&csrfmiddlewaretoken="+getCSRFToken(),
			dataType: "json",
			success: function() {
				alert("Added! Wait for Others' Actions.");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
     			alert("some error");
  			}
		});
	});
}

function confirmRoomie() {
	var propertyid = selected_chat.parent().find("#propertyid").val();
	$(document).on("click", "#confirm", function() {
		$.ajax({
			url: "/roomie/chatroom_confirmroomie",
			type: "POST",
			data: "groupid="+selected_chat.find("#groupid").val()+"&propertyid="+propertyid+"&csrfmiddlewaretoken="+getCSRFToken(),
			dataType: "json",
			success: function() {
				alert("Confirmed! Wait for Others' Actions.");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
     			alert("some error");
  			}
		});
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
	getContacts();
	displayChat();
});