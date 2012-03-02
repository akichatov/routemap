class GpxTrack
  UNIT_FACTOR = { meters: 1.0, kms: 0.001 }
  attr_reader :min, :max, :points, :hdistance, :htdistance

  def self.parse(gpx_file)
    points = []
    doc = Nokogiri::XML(File.open(gpx_file))
    doc.search("trkpt").each do |point|
      lat = point.attr("lat").to_f
      lon = point.attr("lon").to_f
      points.push({ lat: lat, lon: lon, ele: point.search("ele").first.content.to_f })
    end
    GpxTrack.new(points)
  end

  def distance_haversine(options={})
    current = @points.first
    result = 0.0
    @points.each do |point|
      result += Geo.distance(current[:lat], current[:lon], point[:lat], point[:lon],
        current[:ele], point[:ele], options[:total] ? 1 : 0)
      current = point
    end
    result * UNIT_FACTOR[options[:units] || :meters]
  end

private

  def initialize(points)
    @points = points
    lats = @points.map{|p| p[:lat]}
    lons = @points.map{|p| p[:lon]}
    @min = {lat: lats.min, lon: lons.min}
    @max = {lat: lats.max, lon: lons.max}
    @hdistance = distance_haversine(units: :kms)
    @htdistance = distance_haversine(units: :kms, total: true)
  end


end