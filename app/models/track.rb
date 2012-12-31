class Track < ActiveRecord::Base
  include RandomCode

  belongs_to :user
  belongs_to :tag
  has_one :version, dependent: :destroy

  has_attached_file :attachment, {
    hash_data: ':class/:attachment/:id/:code',
    hash_secret: 'track_attachment_secret'
  }.merge(TRACK_ATTACHMENT_OPTS)

  attr_accessible :name, :attachment, :tag_name
  attr_accessor :output
  attr_writer :tag_name

  validates_presence_of :name
  validates :attachment, attachment_presence: true
  validate :has_points

  scope :ordered, joins(:version).order("tracks.tag_id, versions.start_at")
  scope :start_at_ordered, joins(:version).order("versions.start_at")

  before_save   :update_tag, :process_data

  delegate *Version::ATTRIBUTES, to: :version

  def tag_name
    @tag_name || self.tag.try(:name)
  end

  def output
    @output ||= Gpx.parse(self)
  end

  def many_days?
    (end_at.in_time_zone(timezone).to_date - start_at.in_time_zone(timezone).to_date) > 0
  end

  def points
    version.to_hash[:points]
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

  def update_tag
    self.tag = user.tags.find_or_create_by_name(@tag_name) if @tag_name.present?
  end

  def process_data
    if attachment.dirty?
      self.version ||= Version.new(track: self)
      self.version.init_by(output)
      self.version.save! unless self.version.new_record?
    end
  end

end
