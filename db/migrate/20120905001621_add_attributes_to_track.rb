class AddAttributesToTrack < ActiveRecord::Migration
  def change
    add_column :tracks, :distance, :integer
    add_column :tracks, :climb, :integer
    add_column :tracks, :descent, :integer
    add_column :tracks, :processed, :boolean, null: false, default: false
  end
end
