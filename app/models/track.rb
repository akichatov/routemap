class Track < ActiveRecord::Base
  belongs_to :user
  belongs_to :tag
  has_one :statistic, dependent: :destroy
  has_one :version, dependent: :destroy

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

  def output
    @output ||= Gpx.parse(self)
  end

private

  def has_points
    return unless attachment.present?
    @output = Gpx.parse(self)
    if @output.points.size == 0
      @output = nil
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
    if attachment.dirty?
      self.timezone = output.timezone

      self.statistic ||= Statistic.new(track: self)
      self.statistic.init_by(output)
      self.statistic.save! unless self.statistic.new_record?

      self.version ||= Version.new(track: self)
      self.version.init_by(output)
      self.version.save! unless self.version.new_record?
    end
  end

  def update_position
    self.update_column(:position, tag.tracks.start_date_ordered.index(self)) if tag
  end

end
