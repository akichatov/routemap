require 'spec_helper'

describe Track do
  it { should have_attached_file(:attachment) }

  describe "save" do
    context "successfull" do
      before do
        @track = Track.create(name: 'track', attachment: File.new(Rails.root + 'spec/fixtures/gpx/051011.gpx'))
      end
      context "new" do
        it "should create statistic" do
          @track.save
          @track.statistic.should be_persisted
        end
      end

      context "existent" do
        it "should update statistic" do
          track = Track.find(@track.id)
          distance = track.statistic.distance
          track.update_attributes(attachment: File.new(Rails.root + 'spec/fixtures/gpx/050911.gpx'))
          track.statistic.distance.should_not be_equal(distance)
        end
      end
    end

    context "unsuccessfull" do
      context "validations" do
        context "new" do
          before do
            @track = Track.new(name: 'track', attachment: File.new(Rails.root + 'spec/fixtures/gpx/empty.gpx'))
          end
          it "should reject empty file" do
            @track.should_not be_valid
          end
        end

        context "existent" do
          before do
            @track = Track.create(name: 'track', attachment: File.new(Rails.root + 'spec/fixtures/gpx/050911.gpx'))
            @track.update_attributes(attachment: File.new(Rails.root + 'spec/fixtures/gpx/empty.gpx'))
          end
          it "should reject empty file" do
            @track.should_not be_valid
          end
        end
      end
    end

  end

end