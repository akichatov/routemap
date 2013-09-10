namespace :routemap do
  namespace :tracks do
    desc "Update track clib/descent"
    task update_versions: :environment do
      User.all.each do |user|
        puts "Processing user: #{user.id} ..."
        user.tracks.each do |track|
          track.version.init_by Output.new(track.points, track)
          track.version.save
        end
      end
    end
  end
end