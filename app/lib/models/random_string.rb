module RandomString
  DEFAULT_LENGTH = 24

  def generate(length=DEFAULT_LENGTH)
    SecureRandom.urlsafe_base64(length)
  end

  module_function :generate
end