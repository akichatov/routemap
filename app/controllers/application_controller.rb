class ApplicationController < ActionController::Base
  protect_from_forgery
  rescue_from ActiveRecord::RecordNotFound, :with => :render_404

  before_filter :set_locale

  def render_404
    render 'errors/404', :formats => [:html], :status => 404
  end

  def set_locale
    logger.debug "* Accept-Language: #{request.env['HTTP_ACCEPT_LANGUAGE']}"
    I18n.locale = extract_locale
    logger.debug "* Locale set to '#{I18n.locale}'"
  end

  private

  def extract_locale
    accept_lang = request.env['HTTP_ACCEPT_LANGUAGE']
    accept_lang && accept_lang.scan(/^[a-z]{2}/).first || I18n.default_locale
  end

end
