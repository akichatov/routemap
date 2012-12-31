class Output
  UNIT_FACTOR = { meters: 1.0, kms: 0.001 }
  SPEED_TIME_LIMIT_SEC = 10
  MOTION_SPEED_LIMIT = 0.35

  attr_reader *Version::ATTRIBUTES + [:min, :max, :points, :name]

  def initialize(points, track)
    @points = points
    @name = track.name
    init_track_data if @points.size > 0
  end

  def distance_haversine(options={})
    current = @points.first
    result = 0.0
    @points.each do |point|
      delta = Geo.distance(current[:lat], current[:lon], point[:lat], point[:lon]).round(2)
      result += delta
      point[:dist] = delta
      point[:fdist] = result.round(2)
      current = point
    end
    result.round(2) * UNIT_FACTOR[options[:units] || :meters]
  end

private

  def init_track_data
    @distance = distance_haversine
    lats = @points.map{|p| p[:lat]}
    lons = @points.map{|p| p[:lon]}
    eles = @points.map{|p| p[:ele]}
    @min = {lat: lats.min, lon: lons.min, ele: eles.min}
    @max = {lat: lats.max, lon: lons.max, ele: eles.max}
    @total_time = @points.last[:time] - @points.first[:time]
    @start_at = Time.at(@points.first[:time]).utc
    @end_at = Time.at(@points.last[:time]).utc
    @timezone = Timezone::Zone.new(latlon: [@points.first[:lat], @points.first[:lon]]).zone

    previous_point = @points.first
    @climb = @descent = 0.0
    @motion_time = 0
    @points.each_with_index do |point, index|
      delta_height = point[:ele] - previous_point[:ele]
      @climb += delta_height if delta_height > 0
      @descent += delta_height.abs if delta_height < 0
      point[:speed] = calculate_speed(point, index)
      @motion_time += point[:time] - previous_point[:time] if point[:speed] > MOTION_SPEED_LIMIT
      previous_point = point
    end

    speeds = @points.map{|p| p[:speed]}
    @max_speed = speeds.max
    motion_speeds = speeds.select{|s| s > MOTION_SPEED_LIMIT }
    @avg_motion_speed = motion_speeds.size > 0 ? (motion_speeds.inject(:+) / motion_speeds.size).round(2) : 0.0
  end

  def calculate_speed(point, index)
    time = 0
    dist = 0
    i = 1
    previous = @points[index - i]
    while previous && time < SPEED_TIME_LIMIT_SEC
      time = point[:time] - previous[:time]
      dist = point[:fdist] - previous[:fdist]
      i += 1
      previous = @points[index - i]
    end
    if time > 0
      return ((dist / 1000.0) / (time / 3600.0)).round(2)
    end
    return 0.0
  end

end
