class AddCodeToTags < ActiveRecord::Migration
  def change
    add_column :tags, :code, :string
  end
end
