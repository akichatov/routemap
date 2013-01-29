class MoveTagIdFromTracksToTagsTracks < ActiveRecord::Migration

  def up
    create_table :tags_tracks do |t|
      t.references :tag
      t.references :track
      t.timestamps
    end
    add_index :tags_tracks, [:tag_id, :track_id], unique: true

    execute <<-EOS
      INSERT INTO tags_tracks
        (tag_id, track_id, created_at, updated_at)
        (SELECT tag_id, id, created_at, created_at
        FROM tracks WHERE tag_id IS NOT NULL)
    EOS

    remove_column :tracks, :tag_id
  end

  def down
    add_column :tracks, :tag_id, :integer

    execute <<-EOS
      UPDATE tracks t set t.tag_id = (SELECT tag_id FROM tags_tracks tt WHERE tt.track_id = t.id LIMIT 1)
    EOS

    drop_table :tags_tracks
  end
end
