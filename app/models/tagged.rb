module Tagged
  def self.included(base)
    base.class_eval do
      belongs_to :tag
      attr_accessible :tag_name
      attr_writer :tag_name
      before_save :update_tag
    end
  end

  def tag_name
    @tag_name || self.tag.try(:name)
  end

  private

  def update_tag
    self.tag = user.tags.find_or_create_by_name(@tag_name) if @tag_name.present?
  end
  
end