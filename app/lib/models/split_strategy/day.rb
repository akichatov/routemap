module SplitStrategy
  class Day < Base

    def process(points)
      points.group_by{ |point| Time.at(point[:time]).to_date }
    end

  end
end
