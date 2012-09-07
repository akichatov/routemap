class AddAttributesToTrack < ActiveRecord::Migration
  def change
    add_column :tracks, :distance, :integer
    add_column :tracks, :climb, :integer
    add_column :tracks, :descent, :integer
    add_column :tracks, :min_lat, :double, precision: 9, scale: 6
    add_column :tracks, :min_lon, :double, precision: 9, scale: 6
    add_column :tracks, :max_lat, :double, precision: 9, scale: 6
    add_column :tracks, :max_lon, :double, precision: 9, scale: 6
    add_column :tracks, :min_ele, :double, precision: 7, scale: 2
    add_column :tracks, :max_ele, :double, precision: 7, scale: 2
    add_column :tracks, :processed, :boolean, null: false, default: false
  end
end
