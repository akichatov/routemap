require 'libxml'

class Gpx
  def self.parse(track)
    points = []
    if(track.new_record? || track.attachment.dirty?)
      file = File.open(track.attachment.queued_for_write[:original].path)
    else
      file = Paperclip.io_adapters.for(track.attachment)
    end
    begin
      reader = LibXML::XML::Reader.io(file)
      point = nil
      while reader.read
        if reader.node_type == LibXML::XML::Reader::TYPE_ELEMENT
          if reader.name == "trkpt"
            point = {lat: reader["lat"].to_f, lon: reader["lon"].to_f}
          elsif reader.name == "ele" and point
            point[:ele] = reader.read_string.to_f
          elsif reader.name == "time" and point
            point[:time] = DateTime.parse(reader.read_string).to_i
          end
        elsif reader.node_type == LibXML::XML::Reader::TYPE_END_ELEMENT
          if reader.name == "trkpt" and point
            point[:ele] ||= 0
            points.push(point)
          end
        end
      end
    rescue
      points = []
    end

    Output.new(points, track)
  end
end
