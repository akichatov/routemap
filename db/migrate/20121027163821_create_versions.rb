class CreateVersions < ActiveRecord::Migration
  def up
    create_table :versions do |t|
      t.references :track, null: false
      t.binary :data, limit: 1.megabyte
    end
    add_index :versions, [:track_id]
    execute "INSERT INTO versions (track_id, data) (SELECT id, data FROM tracks)"
    remove_column :tracks, :data
  end

  def down
    add_column :tracks, :data, :binary, limit: 1.megabyte
    execute "UPDATE tracks set tracks.data = (SELECT versions.data FROM versions WHERE versions.track_id = tracks.id)"
    remove_index :versions, [:track_id]
    drop_table :versions
  end
end
