class Statistic < ActiveRecord::Base
  belongs_to :track

  def init_from_track
    self.distance = track.gpx.distance
    self.climb = track.gpx.climb
    self.descent = track.gpx.descent
    self.min_lat = track.gpx.min[:lat]
    self.min_lon = track.gpx.min[:lon]
    self.max_lat = track.gpx.max[:lat]
    self.max_lon = track.gpx.max[:lon]
    self.min_ele = track.gpx.min[:ele]
    self.max_ele = track.gpx.max[:ele]
    self.total_time = track.gpx.total_time
    self.motion_time = track.gpx.motion_time
    self.avg_motion_speed = track.gpx.avg_motion_speed
    self.max_speed = track.gpx.max_speed
    self.start_date = track.gpx.start_date
    self.end_date = track.gpx.end_date
  end

end