class ChangeDataSizeInTracks < ActiveRecord::Migration
  def change
    change_column :tracks, :data, :binary, limit: 1.megabyte
  end
end
