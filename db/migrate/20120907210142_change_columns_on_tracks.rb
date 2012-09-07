class ChangeColumnsOnTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :min_lat, :decimal, precision: 9, scale: 6
    add_column :tracks, :min_lon, :decimal, precision: 9, scale: 6
    add_column :tracks, :max_lat, :decimal, precision: 9, scale: 6
    add_column :tracks, :max_lon, :decimal, precision: 9, scale: 6
    add_column :tracks, :min_ele, :decimal, precision: 7, scale: 2
    add_column :tracks, :max_ele, :decimal, precision: 7, scale: 2
  end
end
