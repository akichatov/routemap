class PartitionsController < ApplicationController
  before_filter :authenticate_user!
  before_filter :find_track
  before_filter :setup_partition

  def create
    redirect_to @track and return unless @partition.split?
    tag = @track.tag
    if @partition.save
      redirect_to tag ? tag_tracks_path(tag) : tracks_path
    else
      render :new
    end
  end

private

  def find_track
    @track = current_user.tracks.find_by_code!(params[:track_id])
  end

  def setup_partition
    @partition = Partition.new((params[:partition] || {split: 'true'}).merge(track: @track))
    @partition.selected = (0..@partition.parts.length - 1).map{|i| i.to_s} unless params[:partition]
  end

end
