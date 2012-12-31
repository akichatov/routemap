namespace :routemap do
  namespace :tracks do
    desc "Update track positions"
    task update_versions: :environment do
      User.all.each do |user|
        puts "Processing user: #{user.id} ..."
        user.tracks.each do |track|
          data = track.version.to_hash
          data[:start_at] = data.delete(:start_date)
          data[:end_at] = data.delete(:end_date)
          track.version.set_data_json(data.to_json)
          track.version.save
        end
      end
    end
  end
end