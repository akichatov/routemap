class Geo
  RADIUS = 6372797.560856
  RADIAN_PER_DEGREE = Math::PI / 180.0

  def self.distance(lat1, lon1, lat2, lon2)
    lat1_radians = lat1 * RADIAN_PER_DEGREE
    lat2_radians = lat2 * RADIAN_PER_DEGREE
    distance_lat = (lat2 - lat1) * RADIAN_PER_DEGREE
    distance_lon = (lon2 - lon1) * RADIAN_PER_DEGREE

    a = Math.sin(distance_lat / 2.0)**2.0 + Math.cos(lat1_radians) * Math.cos(lat2_radians) * Math.sin(distance_lon / 2.0)**2.0
    RADIUS * 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a))
  end

end