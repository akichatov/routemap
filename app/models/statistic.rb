class Statistic < ActiveRecord::Base
  belongs_to :track

  def init_by(gpx)
    self.distance = gpx.distance
    self.climb = gpx.climb
    self.descent = gpx.descent
    self.min_lat = gpx.min[:lat]
    self.min_lon = gpx.min[:lon]
    self.max_lat = gpx.max[:lat]
    self.max_lon = gpx.max[:lon]
    self.min_ele = gpx.min[:ele]
    self.max_ele = gpx.max[:ele]
    self.total_time = gpx.total_time
    self.motion_time = gpx.motion_time
    self.avg_motion_speed = gpx.avg_motion_speed
    self.max_speed = gpx.max_speed
    self.start_date = gpx.start_date
    self.end_date = gpx.end_date
  end

end