namespace :routemap do
  namespace :tags do
    desc "Find all near due tasks and send reminders"
    task update_codes: :environment do
      Tag.all.each do |tag|
        puts "Processing tag: #{tag.id} ..."
        tag.update_column(:code, RandomString.generate)
      end
    end

    desc "Update track positions inside tags"
    task update_positions: :environment do
      Tag.all.each do |tag|
        puts "Processing tag: #{tag.id} ..."
        tag.tracks.ordered.each_with_index do |track, index|
          track.update_column(:position, index)
        end
      end
    end
  end
end