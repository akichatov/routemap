class MoveStatisticsToVerstions < ActiveRecord::Migration

  def change
    add_column :versions, :start_at, :datetime
    add_column :versions, :end_at, :datetime
    add_column :versions, :distance, :integer
    add_column :versions, :climb, :integer
    add_column :versions, :descent, :integer
    add_column :versions, :total_time, :integer
    add_column :versions, :motion_time, :integer
    add_column :versions, :max_speed, :decimal, precision: 7, scale: 2
    add_column :versions, :avg_motion_speed, :decimal, precision: 7, scale: 2
    add_column :versions, :timezone, :string
    add_column :versions, :created_at, :datetime, null: false
    add_column :versions, :updated_at, :datetime, null: false

    execute <<-EOS
    UPDATE versions v, statistics s SET v.start_at = s.start_date,
                                        v.end_at = s.end_date,
                                        v.distance = s.distance,
                                        v.climb = s.climb,
                                        v.descent = s.descent,
                                        v.total_time = s.total_time,
                                        v.motion_time = s.motion_time,
                                        v.max_speed = s.max_speed,
                                        v.avg_motion_speed = s.avg_motion_speed,
                                        v.created_at = s.created_at,
                                        v.updated_at = s.updated_at
    WHERE s.track_id = v.track_id
    EOS

    execute <<-EOS
    UPDATE versions v, tracks t SET v.timezone = t.timezone
    WHERE v.track_id = t.id
    EOS

    drop_table :statistics
    remove_column :tracks, :timezone
    remove_column :tracks, :processed
    remove_column :tracks, :position
  end

end
