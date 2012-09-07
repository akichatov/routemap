class Tag < ActiveRecord::Base
  belongs_to :user
  has_many :tracks

  before_create :generate_code

  def to_param
    self.code
  end

  private

  def generate_code
    self.code = RandomString.generate
  end

end
