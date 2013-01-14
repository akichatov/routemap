class PhotoExif

  def self.parse(photo)
    if(photo.new_record? || photo.attachment.dirty?)
      path = photo.attachment.queued_for_write[:original].path
    else
      path = Paperclip.io_adapters.for(photo.attachment).path
    end

    exifr = EXIFR::JPEG.new(path)
    if exifr.exif?
      photo.date = exifr.date_time.utc
      if exifr.gps
        photo.lat = exifr.gps.latitude
        photo.lon = exifr.gps.longitude
        photo.direction = exifr.gps.image_direction
      end
    end
  end

end