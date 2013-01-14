class Photo < ActiveRecord::Base
  include RandomCode, Tagged
  CONTENT_TYPES = %w(image/jpeg)

  belongs_to :user

  has_attached_file :attachment, {
    styles: {
      icon: ["24x24#"],
      thumb: ["75x75#"],
      small: ["76800@"],  # 320x240
      medium: ["307200@"],# 640x480
      large: ["786432@"]  # 1024x768
    },
    hash_data: ':class/:attachment/:id/:code',
    hash_secret: 'photo_attachment_secret'
  }.merge(PHOTO_ATTACHMENT_OPTS)

  attr_accessible :attachment

  before_post_process :image?
  validate :image?
  validates_attachment :attachment, presence: true, size: { less_than: 6.megabytes }

  scope :within, lambda { |track|
    where("photos.date BETWEEN '#{track.start_at.utc.to_formatted_s(:db)}' AND '#{track.end_at.utc.to_formatted_s(:db)}'")
  }
  scope :date_ordered, order(:date)

  before_create :update_data

  def update_data
    PhotoExif.parse(self)
    find_track_position unless lat && lon
  end

  def image?
    unless CONTENT_TYPES.include?(attachment_content_type)
      errors.add(:attachment_content_type, :invalid)
      return false
    end
    true
  end

  def find_track_position
    tracks = user.tracks.within(self)
    if tracks.any?
      point = tracks.first.points.detect{|p| p[:time] > date.utc.to_i}
      if point
        self.lat = point[:lat]
        self.lon = point[:lon]
      end
    end
  end

end