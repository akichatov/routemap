class AddTimezoneToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :timezone, :string
  end
end
