class Track < ActiveRecord::Base
  include RandomCode

  belongs_to :user
  has_one :version, dependent: :destroy
  has_many :tags_tracks, dependent: :delete_all
  has_many :tags, through: :tags_tracks

  has_attached_file :attachment, {
    url: '/system/tracks/attachments/:id/:basename.:extension'
  }.merge(TRACK_ATTACHMENT_OPTS)

  attr_accessible :name, :attachment
  attr_accessor :output
  attr_accessible :tag_name
  attr_writer :tag_name

  validates_presence_of :name
  validates :attachment, attachment_presence: true
  validate :has_points

  scope :ordered, joins(:version).order("versions.start_at")
  scope :start_at_ordered, joins(:version).order("versions.start_at")
  scope :within, lambda { |photo|
    joins(:version).where("'#{photo.date.utc.to_formatted_s(:db)}' BETWEEN versions.start_at AND versions.end_at")
  }

  before_save :process_data
  before_save :update_tag

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

  def tag_name
    @tag_name || tags.map(&:name).join(', ')
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

  def update_tag
    self.tags = @tag_name.split(',').map do |name|
      user.tags.find_or_create_by_name(name.strip) if name.present?
    end.compact if @tag_name.present?
  end

end
