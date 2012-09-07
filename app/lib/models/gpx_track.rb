require 'libxml'
class GpxTrack

  UNIT_FACTOR = { meters: 1.0, kms: 0.001 }
  attr_reader :min, :max, :points, :distance, :climb, :descent, :name

  def self.parse(track)
    if track.new_record?
      file = track.attachment.to_file
    else
      if Rails.env == 'production'
        require 'open-uri'
        file = open(track.attachment.url)
      else
        file = File.open(track.attachment.path)
      end
    end

    points = []
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
            point[:time] = DateTime.parse(reader.read_string)
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

    GpxTrack.new(points, track)
  end

  def distance_haversine(options={})
    current = @points.first
    result = 0.0
    @points.each do |point|
      delta = Geo.distance(current[:lat], current[:lon], point[:lat], point[:lon])
      result += delta
      point[:dist] = delta
      current = point
    end
    result * UNIT_FACTOR[options[:units] || :meters]
  end

private

  def initialize(points, track)
    @points = points
    @name = track.name
    @distance = distance_haversine
    if track.processed
      @climb = track.climb
      @descent = track.descent
      @min = {lat: track.min_lat, lon: track.min_lon, ele: track.min_ele}
      @max = {lat: track.max_lat, lon: track.max_lon, ele: track.max_ele}
    else
      process_track
    end
  end

  def calculate_climb_descent
    previous_point = @points.first
    @climb = @descent = 0.0
    @points.each do |point|
      delta_height = point[:ele] - previous_point[:ele]
      @climb += delta_height if delta_height > 0
      @descent += delta_height.abs if delta_height < 0
      previous_point = point
    end
  end

  def process_track
    lats = @points.map{|p| p[:lat]}
    lons = @points.map{|p| p[:lon]}
    eles = @points.map{|p| p[:ele]}
    @min = {lat: lats.min, lon: lons.min, ele: eles.min}
    @max = {lat: lats.max, lon: lons.max, ele: eles.max}
    calculate_climb_descent
  end

end