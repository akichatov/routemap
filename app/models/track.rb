class Track < ActiveRecord::Base
  belongs_to :user
  belongs_to :tag
  attr_accessible :name, :attachment, :tag_name
  attr_writer :tag_name

  has_attached_file :attachment, {
    hash_data: ':class/:attachment/:id/:code',
    hash_secret: 'track_attachment_secret'
  }.merge(TRACK_ATTACHMENT_OPTS)

  validates_presence_of :name, :attachment_file_name
  validate :has_points

  before_create :generate_code
  before_save   :update_tag, :process_data

  def tag_name
    @tag_name || self.tag.try(:name)
  end

  def to_param
    self.code
  end

  def gpx
    @gpx_track ||= GpxTrack.parse(self)
  end

  def points
    gpx.points
  end

private

  def has_points
    if points.size == 0
      errors.add :attachment, "can't be processed."
    end
  end

  def generate_code
    self.code = RandomString.generate
  end

  def update_tag
    self.tag = user.tags.find_or_create_by_name(@tag_name) if @tag_name.present?
  end

  def process_data
    unless self.processed
      self.distance = gpx.distance
      self.climb = gpx.climb
      self.descent = gpx.descent
      self.min_lat = gpx.min[:lat]
      self.min_lon = gpx.min[:lon]
      self.max_lat = gpx.max[:lat]
      self.max_lon = gpx.max[:lon]
      self.min_ele = gpx.min[:ele]
      self.max_ele = gpx.max[:ele]
      self.processed = true
    end
  end

end
