class ApplicationController < ActionController::Base
  protect_from_forgery
  rescue_from ActiveRecord::RecordNotFound, :with => :render_404

  def render_404
    render 'errors/404', :formats => [:html], :status => 404
  end

end
