require 'inline'

class Geo
  inline :C do |builder|
    builder.include '<cmath>'
    builder.add_compile_flags '-x c++', '-lstdc++'
    builder.add_static "RADIUS", 6372797.560856, 'double'
    builder.add_static "RADIAN_PER_DEGREE", Math::PI / 180.0, 'double'

    builder.c_singleton %Q[
      double distance(double lat1, double lon1, double lat2, double lon2, double ele1, double ele2, int use_ele) {
        double lat1_radians = lat1 * RADIAN_PER_DEGREE;
        double lat2_radians = lat2 * RADIAN_PER_DEGREE;
        double distance_lat = (lat2 - lat1) * RADIAN_PER_DEGREE;
        double distance_lon = (lon2 - lon1) * RADIAN_PER_DEGREE;

        double a = pow(sin(distance_lat / 2.0), 2.0) + cos(lat1_radians) * cos(lat2_radians) * pow(sin(distance_lon / 2.0), 2.0);
        double distance = RADIUS * 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
        if(use_ele == 1) {
          distance = sqrt(pow(distance, 2.0) + pow(abs(ele2 - ele1), 2.0));
        }
        return distance;
    }]

  end
end