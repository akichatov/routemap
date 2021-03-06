# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130129204222) do

  create_table "photos", :force => true do |t|
    t.integer  "user_id",                                               :null => false
    t.integer  "tag_id"
    t.string   "code",                                                  :null => false
    t.string   "attachment_file_name",                                  :null => false
    t.integer  "attachment_file_size",                                  :null => false
    t.string   "attachment_content_type",                               :null => false
    t.datetime "date"
    t.decimal  "lat",                     :precision => 9, :scale => 6
    t.decimal  "lon",                     :precision => 9, :scale => 6
    t.decimal  "direction",               :precision => 6, :scale => 3
    t.datetime "created_at",                                            :null => false
    t.datetime "updated_at",                                            :null => false
  end

  add_index "photos", ["code"], :name => "index_photos_on_code"
  add_index "photos", ["tag_id"], :name => "index_photos_on_tag_id"
  add_index "photos", ["user_id"], :name => "index_photos_on_user_id"

  create_table "tags", :force => true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "code"
  end

  create_table "tags_tracks", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "track_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "tags_tracks", ["tag_id", "track_id"], :name => "index_tags_tracks_on_tag_id_and_track_id", :unique => true

  create_table "tracks", :force => true do |t|
    t.string   "name",                    :null => false
    t.string   "code",                    :null => false
    t.string   "attachment_file_name",    :null => false
    t.integer  "attachment_file_size",    :null => false
    t.string   "attachment_content_type", :null => false
    t.datetime "created_at",              :null => false
    t.datetime "updated_at",              :null => false
    t.integer  "user_id"
  end

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "remember_token"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "versions", :force => true do |t|
    t.integer  "track_id",                                                           :null => false
    t.binary   "data",             :limit => 16777215
    t.datetime "start_at"
    t.datetime "end_at"
    t.integer  "distance"
    t.integer  "climb"
    t.integer  "descent"
    t.integer  "total_time"
    t.integer  "motion_time"
    t.decimal  "max_speed",                            :precision => 7, :scale => 2
    t.decimal  "avg_motion_speed",                     :precision => 7, :scale => 2
    t.string   "timezone"
    t.datetime "created_at",                                                         :null => false
    t.datetime "updated_at",                                                         :null => false
  end

  add_index "versions", ["track_id"], :name => "index_versions_on_track_id"

end
