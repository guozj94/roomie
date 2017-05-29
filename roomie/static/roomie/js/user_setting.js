



// Sends a new request to update the to-do list
function get_user_setting() {
    $.ajax({
        url: "/roomie/usersetting",
        type: "GET",
        dataType : "json",
        // run js function if success, receive data in JSON from view.py
        success: update_user_setting_html(response),
    });        
}


function set_user_setting() {
    // [?] why need to declare
    $(document).on("click", ".comment_button", function() {
        // var comment_content_element = $(this).parent().find(".comment_input");
        // var comment_content = comment_content_element.val();
        // var feed_id_element = $(this).parent().find(".feed_id");
        // var feed_id = feed_id_element.val();
        // var user_id_element = $(".user_id_ajax");
        // var user_id = user_id_element.val();
        var setting_text = $(this).parent().find(".setting input");
        $.ajax({
            url: "/roomie/usersetting",
            type: "POST",
            // data: "feed_id="+feed_id+"&user_id="+1+"&comment-content="+comment_content+"&csrfmiddlewaretoken="+getCSRFToken(),
            dataType : "json",
            success: function(response) {
                // [?] how to check
                if (Array.isArray(response)) {
                    update_user_setting_html(response);    
                } else {
                    displayError(response.error);
                }
            }
        });
    });    
}

function update_user_setting_html(response) {
    // wait
    $(response).each(function() {
        // $(".all-posts").append(strVar);
        var strVar="";
        strVar += "<div class=\"panel panel-default post\">";
        strVar += " <div class=\"panel-heading\">";
        strVar += "     <i class=\"glyphicon glyphicon-user\"><\/i>";
        strVar += "     <a href=\"\/socialnetwork\/profile?username=\" onclick=\"location.href=this.href+"+this.username+"\"> "+this.first_name+" "+this.last_name+"<\/a><\/div>";
        strVar += " <div class=\"panel-body\">";
        strVar += "     <p><img src=\"/socialnetwork/picture/"+this.user_id+"\" class=\"img-circle pull-right\" alt=\""+this.username+"\" width=\"100px\"> "+this.post+"<\/p>";
        strVar += " <div class=\"clearfix\"><\/div>";
        strVar += " <hr>";
        strVar += " <label>Comment<\/label>";
        strVar += " <p>";
        $(this.comments).each(function(){
            strVar += "             <br>";
            strVar += "             <div>";
            strVar += "                 <img src=\"/socialnetwork/picture/"+this.user_id+"\" class=\"img-circle\" style=\"height: 30px; width: 30px;\" alt=\""+this.username+"\">";
            strVar += "                 <a href=\"\/socialnetwork\/profile?username=\" onclick=\"location.href=this.href+"+this.username+"\"> "+this.first_name+" "+this.last_name+"<\/a> "+this.date+"                  ";
            strVar += "                 <br>";
            strVar += "                 "+this.content+"";
            strVar += "             <\/div>";
        })

        strVar += " <\/p>";
        strVar += " ";
        strVar += " <div class=\"form-group\" style=\"padding:14px;\">";
        strVar += "     <input class=\"form-control comment_input\" placeholder=\"Comment\" type=\"text\" name=\"comment-content\" id=\"input-content\" value=\"\" >";
        strVar += " <\/div>";
        strVar += " <button type=\"button\" name=\"comment\" class=\"btn btn-primary pull-right comment_button\">Comment<\/button><ul class=\"list-inline\"><li><a href=\"\"><\/a><\/li><\/ul>";
        strVar += " <input type=\"hidden\" name=\"feed_id\" class=\"feed_id\" value=\""+this.id+"\">";
        strVar += " <hr>";
        strVar += " "+this.date+"";
        
        if (this.user_id != this.login_user_id){
            strVar += " <form method=\"post\" action=\"/socialnetwork/globalstream\">";
            strVar += "     <button type=\"submit\" name=\"follow\" id=\"follow\" value=\"\">follow<\/button>";
            strVar += "     <input type=\"hidden\" name=\"post_user_id\" value=\""+this.user_id+"\">";
            strVar += "     <button type=\"submit\" name=\"unfollow\" id=\"unfollow\" value=\"\">unfollow<\/button>";
            strVar += "     <input type=\"hidden\" name=\"csrfmiddlewaretoken\" value=\""+getCSRFToken()+"\">";
            strVar += " <\/form>";

        }
        strVar += " <\/div>";
        strVar += "<\/div>";            

        $(".all-posts").append(strVar);
    });
    add_comment();    
}  

  
    // $(items).each(function() {
    //     // $(".all-posts").append(strVar);
    //     document.write(this.user_id);
    //     $(this.comments).each(function(){
    //         document.write(this.content);    
    //     })
        
        // this.comments.each(function(){
        //     document.write(this.content);     
        // });
        
        // document.write(this.global_posts);



// function sanitize(s) {
//     // Be sure to replace ampersand first
//     return s.replace(/&/g, '&amp;')
//             .replace(/</g, '&lt;')
//             .replace(/>/g, '&gt;')
//             .replace(/"/g, '&quot;');
// }

// function displayError(message) {
//     $("#error").html(message);
// }

function add_comment() {
    $(document).on("click", ".comment_button", function() {
        var comment_content_element = $(this).parent().find(".comment_input");
        var comment_content = comment_content_element.val();
        var feed_id_element = $(this).parent().find(".feed_id");
        var feed_id = feed_id_element.val();
        var user_id_element = $(".user_id_ajax");
        var user_id = user_id_element.val();

        // displayError('');

        $.ajax({
            url: "/socialnetwork/globalstream_json",
            type: "POST",
            data: "feed_id="+feed_id+"&user_id="+1+"&comment-content="+comment_content+"&csrfmiddlewaretoken="+getCSRFToken(),
            dataType : "json",
            success: function(response) {
                updateList(response);
                if (Array.isArray(response)) {
                    // updateList(response);
                    ;
                } else {
                    displayError(response.error);
                }
                comment_content_element.val('');
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

// function deleteItem(id) {
//     $.ajax({
//         url: "/jquery-todolist/delete-item/"+id,
//         type: "POST",
//         data: "csrfmiddlewaretoken="+getCSRFToken(),
//         dataType : "json",
//         success: updateList
//     });
// }

// // The index.html does not load the list, so we call getPost()
// // as soon as page is finished loading
window.onload = get_user_setting;

// causes list to be re-fetched every 5 seconds
// window.setInterval(get_user_setting, 5000);
