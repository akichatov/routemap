class TracksController < ApplicationController
  before_filter :authenticate_user!, except: [:show]
  before_filter :find_track, only: [:edit, :update, :destroy]

  def index
    @tracks = current_user.tracks
  end

  def new
    @track = Track.new
  end

  def create
    @track = current_user.tracks.build(params[:track])
    if @track.save
      redirect_to @track, notice: 'Track was successfully created.'
    else
      render action: "new"
    end
  end

  def show
    @track = Track.find_by_code(params[:id])
  end

  def update
    if @track.update_attributes(params[:track])
      redirect_to @track, notice: 'Track was successfully updated.'
    else
      render action: "edit"
    end
  end

  def destroy
    @track.destroy
    redirect_to tracks_path
  end

private

  def find_track
    @track = current_user.tracks.find_by_code(params[:id])
  end

end
