class Tag < ActiveRecord::Base
  include RandomCode

  belongs_to :user
  has_many :tracks, include: :version
  has_many :photos

end
