class GpxTrack
  attr_reader :min, :max, :points

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

private

  def initialize(points)
    @points = points
    lats = @points.map{|p| p[:lat]}
    lons = @points.map{|p| p[:lon]}
    @min = {lat: lats.min, lon: lons.min}
    @max = {lat: lats.max, lon: lons.max}
  end

end