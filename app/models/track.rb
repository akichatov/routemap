class Track < ActiveRecord::Base
  belongs_to :user
  belongs_to :tag
  has_one :statistic, dependent: :destroy
  has_attached_file :attachment, {
    hash_data: ':class/:attachment/:id/:code',
    hash_secret: 'track_attachment_secret'
  }.merge(TRACK_ATTACHMENT_OPTS)

  attr_accessible :name, :attachment, :tag_name, :position
  attr_writer :tag_name

  validates_presence_of :name, :attachment_file_name
  validate :has_points

  scope :ordered, order(:position)
  scope :tag_ordered, order(:tag_id, :position)

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

  def raw_data
    inflate self.data
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
      self.statistic ||= Statistic.new(track: self)
      self.statistic.init_from_track
      self.data = deflate(gpx.to_json)
      self.processed = true
      self.statistic.save
    end
  end

  def deflate(string)
    z = Zlib::Deflate.new
    dst = z.deflate(string, Zlib::FINISH)
    z.close
    dst
  end

  def inflate(string)
    zstream = Zlib::Inflate.new
    buf = zstream.inflate(string)
    zstream.finish
    zstream.close
    buf
  end

end
