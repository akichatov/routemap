class TracksController < ApplicationController
  respond_to :html, :js, :gpx

  before_filter :authenticate_user!, except: [:show]
  before_filter :find_tag
  before_filter :find_tags, only: [:index, :create]
  before_filter :find_tracks, only: [:index, :create]
  before_filter :find_track, only: [:edit, :update, :destroy]
  before_filter :setup_new_track, only: [:index, :new]

  def multi_view
    redirect_to tracks_path and return unless params[:tracks]
    redirect_to track_path(id: params[:tracks].join(','))
  end

  def create
    @track = current_user.tracks.build(params[:track])
    if @track.save
      @tag = @track.tag
      redirect_to @track.many_days? ? new_track_partition_path(@track) : tag_or_tracks_path, notice: t('views.tracks.messages.created')
    else
      render action: :new
    end
  end

  def show
    ids = params[:id].split(',')
    if ids.size > 1
      @tag = Tag.new(name: 'tracks', code: params[:id], tracks: Track.where(code: ids).start_at_ordered)
      render 'tags/show'
    else
      @track = Track.find_by_code!(ids.first)
      respond_with(@track)
    end
  end

  def update
    if @track.update_attributes(params[:track])
      redirect_to tag_or_tracks_path, notice: t('views.tracks.messages.updated')
    else
      render action: "edit"
    end
  end

  def destroy
    @track.destroy
    redirect_to tag_or_tracks_path, notice: t('views.tracks.messages.deleted')
  end

private

  def find_tag
    @tag = current_user.tags.find_by_code!(params[:tag_id]) if params[:tag_id]
  end

  def find_tags
    @tags = current_user.tags
  end

  def find_tracks
    @all_tracks = current_user.tracks.ordered
    if @tag
      @tracks = @tag.tracks.ordered
    else
      @tracks = @all_tracks
    end
  end

  def find_track
    @track = current_user.tracks.find_by_code!(params[:id])
  end

  def tag_or_tracks_path
    @tag ? tag_tracks_path(@tag) : tracks_path
  end

  def setup_new_track
    if @tag
      @track = @tag.tracks.build
    else
      @track = current_user.tracks.build
    end
  end

end
