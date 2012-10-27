class Statistic < ActiveRecord::Base
  belongs_to :track

  def init_by(output)
    self.distance = output.distance
    self.climb = output.climb
    self.descent = output.descent
    self.min_lat = output.min[:lat]
    self.min_lon = output.min[:lon]
    self.max_lat = output.max[:lat]
    self.max_lon = output.max[:lon]
    self.min_ele = output.min[:ele]
    self.max_ele = output.max[:ele]
    self.total_time = output.total_time
    self.motion_time = output.motion_time
    self.avg_motion_speed = output.avg_motion_speed
    self.max_speed = output.max_speed
    self.start_date = output.start_date
    self.end_date = output.end_date
  end
end
