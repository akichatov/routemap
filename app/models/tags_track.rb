class TagsTrack < ActiveRecord::Base
  belongs_to :tag
  belongs_to :track
end