class Partition
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::MassAssignmentSecurity
  extend ActiveModel::Naming

  attr_accessor :track, :parts, :selected, :split
  attr_accessible :selected, :split

  validates :selected, length: { minimum: 1 }

  def initialize(attributes = {})
    attributes.each do |name, value|
      send("#{name}=", value)
    end
    setup_parts
  end

  def persisted?
    false
  end

  def save
    if valid?
      selected.each{ |index| create_part(index.to_i) }
      track.destroy
      return true
    end
    false
  end

  def split?
    split == 'true'
  end

  private

  def setup_parts
    self.parts = {}
    groups = SplitStrategy::Day.new(track).split!
    groups.keys.each do |key|
      self.parts[key] = Output.new(groups[key], track)
    end
    self.selected ||= (0..parts.length - 1).map{|i| i.to_s}
  end

  def create_part(index)
    day = parts.keys[index]
    output = parts[day]
    part = track.user.tracks.build({
      name: "#{track.name} #{day}",
      tags: track.tags,
      output: output,
      attachment: Paperclip.io_adapters.for(track.attachment)
    }, without_protection: true)
    part.save(validate: false)
  end

end