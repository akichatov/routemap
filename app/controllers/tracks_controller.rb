class TracksController < ApplicationController
  before_filter :authenticate_user!, except: [:show]
  before_filter :find_tag, only: [:index, :create]
  before_filter :find_tags, only: [:index, :create]
  before_filter :find_tracks, only: [:index, :create]
  before_filter :find_track, only: [:edit, :update, :destroy]

  def index
    @track = Track.new
  end

  def new
    @track = Track.new
  end

  def create
    @track = current_user.tracks.build(params[:track])
    if @track.save
      path = @track.tag ? tracks_path(group: @track.tag.code) : tracks_path
      redirect_to path, notice: 'Track was successfully created.'
    else
      render action: :index
    end
  end

  def show
    @track = Track.find_by_code!(params[:id])
  end

  def update
    if @track.update_attributes(params[:track])
      redirect_to tracks_path, notice: 'Track was successfully updated.'
    else
      render action: "edit"
    end
  end

  def destroy
    @track.destroy
    redirect_to tracks_path
  end

private

  def find_tag
    @tag = current_user.tags.find_by_code!(params[:group]) if params[:group]
  end

  def find_tags
    @tags = current_user.tags
  end

  def find_tracks
    @all_tracks = current_user.tracks.all
    if @tag
      @tracks = @tag.tracks
    else
      @tracks = @all_tracks
    end
  end

  def find_track
    @track = current_user.tracks.find_by_code!(params[:id])
  end

end
