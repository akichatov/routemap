require 'libxml'
class GpxTrack
  UNIT_FACTOR = { meters: 1.0, kms: 0.001 }
  SPEED_TIME_LIMIT_SEC = 3
  MOTION_SPEED_LIMIT = 0.33

  attr_reader :min, :max, :points, :distance, :climb, :descent, :name,
              :total_time, :motion_time, :stopped_time, :avg_speed, :max_speed, :avg_motion_speed

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

    GpxTrack.new(points, track)
  end

  def distance_haversine(options={})
    current = @points.first
    result = 0.0
    @points.each do |point|
      delta = Geo.distance(current[:lat], current[:lon], point[:lat], point[:lon]).round(2)
      result += delta
      point[:dist] = delta
      point[:fdist] = result.round(2)
      current = point
    end
    result.round(2) * UNIT_FACTOR[options[:units] || :meters]
  end

private

  def initialize(points, track)
    @points = points
    @name = track.name
    init_track_data
  end

  def init_track_data
    @distance = distance_haversine
    lats = @points.map{|p| p[:lat]}
    lons = @points.map{|p| p[:lon]}
    eles = @points.map{|p| p[:ele]}
    @min = {lat: lats.min, lon: lons.min, ele: eles.min}
    @max = {lat: lats.max, lon: lons.max, ele: eles.max}
    @total_time = @points.last[:time] - @points.first[:time]

    previous_point = @points.first
    @climb = @descent = 0.0
    @motion_time = @stopped_time = 0
    @points.each_with_index do |point, index|
      delta_height = point[:ele] - previous_point[:ele]
      @climb += delta_height if delta_height > 0
      @descent += delta_height.abs if delta_height < 0
      point[:speed] = calculate_speed(point, index)
      if point[:speed] > MOTION_SPEED_LIMIT
        @motion_time += point[:time] - previous_point[:time]
      else
        @stopped_time += point[:time] - previous_point[:time]
      end
      previous_point = point
    end

    speeds = @points.map{|p| p[:speed]}
    @avg_speed = ((@distance / 1000.0) / (@total_time / 3600.0)).round(2)
    @max_speed = speeds.max
    motion_speeds = speeds.select{|s| s > MOTION_SPEED_LIMIT }
    @avg_motion_speed = motion_speeds.inject(:+) / motion_speeds.size
  end

  def calculate_speed(point, index)
    time = 0
    dist = 0
    i = 1
    previous = @points[index - i]
    while previous && time < SPEED_TIME_LIMIT_SEC
      time += (point[:time] - previous[:time])
      dist = point[:fdist] - previous[:fdist]
      i += 1
      previous = @points[index - i]
    end
    if time > 0
      return ((dist / 1000.0) / (time / 3600.0)).round(2)
    end
    return 0.0
  end

end