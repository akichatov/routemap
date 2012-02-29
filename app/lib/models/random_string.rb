module RandomString
  DEFAULT_LENGTH = 24

  def generate(length=DEFAULT_LENGTH)
    str = "#{Time.now.to_i}#{rand(99999)}#{object_id}"
    Digest::SHA1.hexdigest(str)[0, length]
  end

  module_function :generate
end