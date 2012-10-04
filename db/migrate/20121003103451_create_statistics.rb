class CreateStatistics < ActiveRecord::Migration
  def change
    create_table :statistics do |t|
      t.references :track, null: false
      t.integer :distance
      t.integer :climb
      t.integer :descent
      t.integer :total_time
      t.integer :motion_time
      t.integer :stopped_time
      t.decimal :max_speed, precision: 7, scale: 2
      t.decimal :avg_speed, precision: 7, scale: 2
      t.decimal :avg_motion_speed, precision: 7, scale: 2
      t.decimal :min_lat, precision: 9, scale: 6
      t.decimal :min_lon, precision: 9, scale: 6
      t.decimal :max_lat, precision: 9, scale: 6
      t.decimal :max_lon, precision: 9, scale: 6
      t.decimal :min_ele, precision: 7, scale: 2
      t.decimal :max_ele, precision: 7, scale: 2
      
      t.timestamps
    end

    remove_column :tracks, :distance
    remove_column :tracks, :climb
    remove_column :tracks, :descent
    remove_column :tracks, :min_lat
    remove_column :tracks, :min_lon
    remove_column :tracks, :max_lat
    remove_column :tracks, :max_lon
    remove_column :tracks, :min_ele
    remove_column :tracks, :max_ele
    
  end
end
