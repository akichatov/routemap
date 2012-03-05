class GpxTrack
  UNIT_FACTOR = { meters: 1.0, kms: 0.001 }
  attr_reader :min, :max, :points, :hdistance, :htdistance, :climb, :descent

  def self.parse(gpx_file)
    points = []
    doc = Nokogiri::XML(File.open(gpx_file))
    doc.search("trkpt").each do |point|
      lat = point.attr("lat").to_f
      lon = point.attr("lon").to_f
      points.push({
        lat: lat, lon: lon,
        ele: point.search("ele").first.content.to_f,
        time: point.search("time").first.content
      })
    end
    GpxTrack.new(points)
  end

  def distance_haversine(options={})
    current = @points.first
    result = 0.0
    @points.each do |point|
      delta = Geo.distance(current[:lat], current[:lon], point[:lat], point[:lon],
        current[:ele], point[:ele], options[:total] ? 1 : 0)
      result += delta
      point[:dist] = delta
      current = point
    end
    result * UNIT_FACTOR[options[:units] || :meters]
  end

private

  def initialize(points)
    @points = points
    lats = @points.map{|p| p[:lat]}
    lons = @points.map{|p| p[:lon]}
    eles = @points.map{|p| p[:ele]}
    @min = {lat: lats.min, lon: lons.min, ele: eles.min}
    @max = {lat: lats.max, lon: lons.max, ele: eles.max}
    @hdistance = distance_haversine
    @htdistance = distance_haversine(total: true)
    calculate_climb_descent
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

end