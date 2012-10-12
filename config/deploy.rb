require 'rvm/capistrano'
require 'bundler/capistrano'
require 'capistrano/ext/multistage'
load "deploy/assets"

set :stages, %w(aak)
set :default_stage, :aak
set :rails_env, :aak
set :keep_releases, 5
set :application, "RouteMap"
set :deploy_to, "/var/www/apps/routemap"
set :scm, :git
set :repository, "git://github.com/akichatov/routemap.git"
set :use_sudo, false
set :deploy_via, :remote_cache

default_run_options[:pty] = true
ssh_options[:forward_agent] = true

after "deploy:update_code", "deploy:cleanup"