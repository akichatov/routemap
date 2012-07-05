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

  before_create :generate_code
  before_save   :update_tag

  def tag_name
    @tag_name || self.tag.try(:name)
  end

  def to_param
    self.code
  end

private

  def generate_code
    self.code = RandomString.generate
  end

  def update_tag
    self.tag = user.tags.find_or_create_by_name(@tag_name) if @tag_name.present?
  end

end
