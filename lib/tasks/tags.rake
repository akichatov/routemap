namespace :routemap do
  namespace :tags do
    desc "Find all near due tasks and send reminders"
    task update_codes: :environment do
      Tag.all.each do |tag|
        puts "Processing tag: #{tag.id} ..."
        tag.update_column(:code, RandomString.generate)
      end
    end
  end
end