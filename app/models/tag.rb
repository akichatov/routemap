class Tag < ActiveRecord::Base
  include RandomCode

  belongs_to :user
  has_many :tags_tracks, dependent: :delete_all
  has_many :tracks, through: :tags_tracks, include: :version
  has_many :photos

end
