class Track < ActiveRecord::Base
  belongs_to :user
  belongs_to :tag
  has_one :statistic, dependent: :destroy
  has_attached_file :attachment, {
    hash_data: ':class/:attachment/:id/:code',
    hash_secret: 'track_attachment_secret'
  }.merge(TRACK_ATTACHMENT_OPTS)

  attr_accessible :name, :attachment, :tag_name
  attr_writer :tag_name

  validates_presence_of :name
  validates :attachment, attachment_presence: true
  validate :has_points

  scope :ordered, joins(:statistic).order("tracks.tag_id, tracks.position, statistics.start_date")
  scope :start_date_ordered, joins(:statistic).order("statistics.start_date")

  before_create :generate_code
  after_create :update_position
  before_save   :update_tag, :process_data

  def tag_name
    @tag_name || self.tag.try(:name)
  end

  def to_param
    self.code
  end

  def gpx
    @gpx_track ||= gpx_track
  end

  def raw_data
    inflate self.data
  end

private

  def has_points
    return unless attachment.present?
    @gpx_track = gpx_track
    if @gpx_track.points.size == 0
      @gpx_track = nil
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
    self.statistic ||= Statistic.new(track: self)
    self.statistic.init_by(gpx)
    self.timezone = gpx.timezone
    self.data = deflate(gpx.to_json)
    self.statistic.save! unless self.statistic.new_record?
  end

  def update_position
    self.update_column(:position, tag.tracks.start_date_ordered.index(self)) if tag
  end

  def gpx_track
    GpxTrack.parse(self)
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
