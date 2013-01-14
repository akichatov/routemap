source 'https://rubygems.org'

gem 'rails', '3.2.8'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  # gem 'coffee-rails', '~> 3.2.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer'

  gem 'uglifier', '>= 1.0.3'
end

group :development, :aak do
  gem 'mysql2'
  gem 'unicorn'
  gem 'capistrano'
  gem 'rvm-capistrano'
  gem 'capistrano-unicorn'
end

gem 'paperclip'
gem 'devise'
gem 'ruby-openid', git: 'git://github.com/openid/ruby-openid.git'
gem 'omniauth-openid'
gem 'libxml-ruby', :require => 'libxml'
gem 'timezone'
gem 'exifr'
gem 'jquery-rails'

group :development, :test do
  gem 'rspec-rails'
end
