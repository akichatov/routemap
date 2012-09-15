$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require "capistrano-unicorn"
set :rails_env, "aak"
set :rvm_ruby_string, 'ruby-1.9.2-p290@routemap'
set :rvm_type, :user
set :rvm_install_type, :head
set :bundle_without, [:development, :production]
set :deploy_to, "/var/www/apps/routemap"
set :scm_verbose, true
set :user, 'aak'
set :branch, "master"
set :unicorn_pid, "#{shared_path}/pids/unicorn.pid"
server "aak-s.local", :app, :web, :db, :primary => true

before 'deploy:restart', 'deploy:migrate'
before 'deploy:setup', 'rvm:install_rvm'
before 'deploy:setup', 'rvm:install_ruby'