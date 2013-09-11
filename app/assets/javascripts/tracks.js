$(function() {
  var updateMultiViewForm = function() {
    $("#tracks_multi_view_submit").attr('disabled', $(".track_code_input:checked").length == 0);
  };
  
  $(".track_code_input").click(updateMultiViewForm);
  
  updateMultiViewForm();
  
  $("#tracks_multi_view").submit(function() {
    $(".track_code_input:checked").each(function() {
      $("#tracks_multi_view").append("<input type='hidden' name='tracks[]' value='" + this.value + "'/>")
    });
  });

  $("#per_page").change(function() {
    $(this).parents("form").submit();
  });

});
