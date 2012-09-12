class AddPositionToTrack < ActiveRecord::Migration
  def change
    add_column :tracks, :position, :integer, default: 0
  end
end
