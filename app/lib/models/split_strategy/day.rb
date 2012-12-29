module SplitStrategy
  class Day < Base

    def process(points, track)
      points.group_by{ |point| Time.at(point[:time]).in_time_zone(track.timezone).to_date }
    end

  end
end
