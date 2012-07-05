class CreateTags < ActiveRecord::Migration
  def change
    create_table :tags do |t|
      t.references :user
      t.string :name
      t.timestamps
    end
    add_column :tracks, :tag_id, :integer
  end
end
