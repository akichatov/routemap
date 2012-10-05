class ChangeColumnsInStatistics < ActiveRecord::Migration
  def change
    add_column :statistics, :start_date, :datetime
    add_column :statistics, :end_date, :datetime
    remove_column :statistics, :avg_speed
    remove_column :statistics, :stopped_time
  end
end
