class Track < ActiveRecord::Base
  include RandomCode, Tagged

  belongs_to :user
  has_one :version, dependent: :destroy

  has_attached_file :attachment, {
    hash_data: ':class/:attachment/:id/:code',
    hash_secret: 'track_attachment_secret'
  }.merge(TRACK_ATTACHMENT_OPTS)

  attr_accessible :name, :attachment
  attr_accessor :output

  validates_presence_of :name
  validates :attachment, attachment_presence: true
  validate :has_points

  scope :ordered, joins(:version).order("tracks.tag_id, versions.start_at")
  scope :start_at_ordered, joins(:version).order("versions.start_at")
  scope :within, lambda { |photo|
    joins(:version).where("'#{photo.date.utc.to_formatted_s(:db)}' BETWEEN versions.start_at AND versions.end_at")
  }

  before_save :process_data

  delegate *Version::ATTRIBUTES, to: :version

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

  def process_data
    if attachment.dirty?
      self.version ||= Version.new(track: self)
      self.version.init_by(output)
      self.version.save! unless self.version.new_record?
    end
  end

end
