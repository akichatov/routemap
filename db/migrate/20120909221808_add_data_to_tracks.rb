class AddDataToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :data, :binary
  end
end
