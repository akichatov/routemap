# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Routemap::Application.initialize!

ENV['INLINEDIR'] = "#{Rails.root.to_s}/lib/inline"