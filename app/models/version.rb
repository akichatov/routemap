class Version < ActiveRecord::Base
  belongs_to :track

  ATTRIBUTES = [:start_at, :end_at, :timezone, :distance, :climb, :descent,
                :total_time, :motion_time, :avg_motion_speed, :max_speed]

  def init_by(output)
    set_data_json(output.to_json)
    ATTRIBUTES.each do |name|
      send("#{name.to_s}=", output.send(name))
    end
  end

  def raw_data
    inflate(self.data)
  end

  def to_hash
    @parsed ||= JSON.parse(raw_data, symbolize_names: true)
  end

  def set_data_json(json)
    self.data = deflate(json)
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
