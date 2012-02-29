class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.string :name, :null => false
      t.string :code, :null => false
      t.string :attachment_file_name, :null => false
      t.integer :attachment_file_size, :null => false
      t.string :attachment_content_type, :null => false

      t.timestamps
    end
  end
end
