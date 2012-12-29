module SplitStrategy
  class Day < Base

    def split!
      @track.points.group_by{ |point| Time.at(point[:time]).in_time_zone(@track.timezone).to_date }
    end

  end
end
