class Track < ActiveRecord::Base

  attr_accessible :name, :attachment

  has_attached_file :attachment, url: "/system/tracks/:id/attachment/:basename.:extension"

  validates_presence_of :name, :attachment_file_name

  before_create :generate_code

  def to_param
    self.code
  end

private

  def generate_code
    self.code = RandomString.generate
  end

end
