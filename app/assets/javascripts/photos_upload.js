var PhotosUpload = function() {
  this.uploadedCount = 0;
  this.totalCount = 0;
  this.filesInput = $("#photo_attachments");
  this.uploadButton = $("#upload_photos");
  this.uploadButton.click($.proxy(this.uploadPhotos, this));
  this.uploadCallbackBound = $.proxy(this.uploadCallback, this);
};

PhotosUpload.prototype.uploadPhotos = function() {
  this.files = $(this.filesInput.get(0).files).toArray();
  this.totalCount = this.files.length;
  this.uploadNext();
  $("#upload_form").hide();
};

PhotosUpload.prototype.uploadNext = function() {
  $("#uploaded_count").html(this.uploadedCount + " of " + this.totalCount + " files processed.");
  if(this.files.length > 0) {
    this.uploading = this.files.shift();
    this.showUploadedStatus();
    var data = new FormData();
    data.append("photo[attachment]", this.uploading);
    data.append("photo[tag_name]", $("#photo_group").val());
    $.ajax({
      type: "POST",
      url: "/photos.js",
      data: data,
      processData: false,
      contentType: false,
      complete: this.uploadCallbackBound
    });
  }
};

PhotosUpload.prototype.showUploadedStatus = function() {
  $("#uploaded_list").append("<span class='thumb load'></span>")
};

PhotosUpload.prototype.uploadCallback = function(data, status) {
  var thumb = $("#uploaded_list span.thumb.load").removeClass("load");
  if(data.status == 200) {
    this.uploadedCount++;
    thumb.addClass("loaded");
  } else {
    thumb.html("<span>" + this.uploading.name + "</span>").addClass("error");
    $("#uploaded_errors").append("<div>" + this.uploading.name + ": " + data.responseText + "</div>")
  }
  this.uploadNext();
};

$(function() {
  new PhotosUpload();
});