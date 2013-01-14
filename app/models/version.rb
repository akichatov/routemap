class Version < ActiveRecord::Base
  belongs_to :track

  ATTRIBUTES = [:start_at, :end_at, :timezone, :distance, :climb, :descent,
                :total_time, :motion_time, :avg_motion_speed, :max_speed]


  def init_by(output)
    @output_json = output.to_json
    set_data_json(@output_json)
    ATTRIBUTES.each do |name|
      send("#{name.to_s}=", output.send(name))
    end
  end

  def raw_data
    @output_json || inflate(data)
  end

  def to_hash
    @parsed ||= JSON.parse(raw_data, symbolize_names: true)
  end

  def set_data_json(json)
    self.data = deflate(json)
  end

  def without(indeces, nullify=false)
    points = to_hash[:points]
    indeces.each{|i| points[i.to_i] = nil }
    init_by Output.new(nullify ? points : points.compact, track)
    self
  end

  private

  def deflate(string)
    z = Zlib::Deflate.new
    dst = z.deflate(string, Zlib::FINISH)
    z.close
    dst
  end

  def inflate(string)
    zstream = Zlib::Inflate.new
    buf = zstream.inflate(string)
    zstream.finish
    zstream.close
    buf
  end

end
