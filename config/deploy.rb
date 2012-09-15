set :stages, %w(aak)
set :default_stage, "aak"
set :keep_releases, 2
require 'capistrano/ext/multistage'
require 'rvm/capistrano'
require 'bundler/capistrano'
load "deploy/assets"

set :application, "RouteMap"

# Use Git
set :scm, :git
set :repository, "git://github.com/akichatov/routemap.git"
set :use_sudo, false
set :deploy_via, :remote_cache

default_run_options[:pty] = true
ssh_options[:forward_agent] = true
