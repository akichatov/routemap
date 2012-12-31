require 'spec_helper'

describe Track do
  it { should have_attached_file(:attachment) }

  describe "save" do
    context "successfull" do
      before do
        @track = Track.create(name: 'track', attachment: File.new(Rails.root + 'spec/fixtures/gpx/051011.gpx'))
      end
      context "new" do
        it "creates version" do
          @track.version.should be_persisted
        end
      end

      context "existent" do
        it "updates version" do
          track = Track.find(@track.id)
          size = track.version.data.size
          track.update_attributes(attachment: File.new(Rails.root + 'spec/fixtures/gpx/050911.gpx'))
          track.version.data.size.should_not be_equal(size)
        end
      end
    end

    context "unsuccessfull" do
      context "validations" do
        context "new" do
          before do
            @track = Track.new(name: 'track', attachment: File.new(Rails.root + 'spec/fixtures/gpx/empty.gpx'))
          end
          it "rejects empty file" do
            @track.should_not be_valid
          end
        end

        context "existent" do
          before do
            @track = Track.create(name: 'track', attachment: File.new(Rails.root + 'spec/fixtures/gpx/050911.gpx'))
            @track.update_attributes(attachment: File.new(Rails.root + 'spec/fixtures/gpx/empty.gpx'))
          end
          it "rejects empty file" do
            @track.should_not be_valid
          end
        end
      end
    end

  end

end