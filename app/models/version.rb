class Version < ActiveRecord::Base
  belongs_to :track

  def init_by(output)
    self.data = deflate(output.to_json)
  end

  def raw_data
    inflate self.data
  end

  def to_hash
    JSON.parse(raw_data, symbolize_names: true)
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
