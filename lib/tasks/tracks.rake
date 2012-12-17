namespace :routemap do
  namespace :tracks do
    desc "Update track positions"
    task update_positions: :environment do
      User.all.each do |user|
        puts "Processing user: #{user.id} ..."
        user.tracks.start_date_ordered.each_with_index do |track, index|
          track.update_column(:position, index)
        end
      end
    end
  end
end