module LayoutHelper
  def javascript(*args)
    content_for(:head) { javascript_include_tag(*args) }
  end
end
