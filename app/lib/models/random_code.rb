module RandomCode

  def self.included(base)
    base.class_eval do
      before_create :generate_code
    end
  end

  def to_param
    self.code
  end

  private

  def generate_code
    begin
      self.code = RandomString.generate(4)
    end while self.class.where(code: code).any? unless code
  end

end