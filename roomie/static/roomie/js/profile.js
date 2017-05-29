$(document).ready(function(){
// Prepare the preview for profile picture
    $("#picture").change(function(){
        $("#submit-pic-bnt").click();
        // readURL(this);
    });
});
// function readURL(input) {
//     if (input.files && input.files[0]) {
//         var reader = new FileReader();

//         reader.onload = function (e) {
//             $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
//         }
//         reader.readAsDataURL(input.files[0]);
//     }
// }