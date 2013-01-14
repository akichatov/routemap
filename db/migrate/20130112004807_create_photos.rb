class CreatePhotos < ActiveRecord::Migration
  def change
    create_table :photos do |t|
      t.references :user, null: false
      t.references :tag
      t.string :code, null: false
      t.string :attachment_file_name, null: false
      t.integer :attachment_file_size, null: false
      t.string :attachment_content_type, null: false
      t.datetime :date
      t.decimal :lat, precision: 9, scale: 6
      t.decimal :lon, precision: 9, scale: 6
      t.decimal :direction, precision: 6, scale: 3
      t.timestamps
    end

    add_index :photos, [:user_id]
    add_index :photos, [:tag_id]
    add_index :photos, [:code]
  end
end
