class PhotosController < ApplicationController
  respond_to :html, :js

  before_filter :authenticate_user!, except: [:index, :show]
  before_filter :find_track, only: [:index]
  before_filter :find_tag, only: [:index]
  before_filter :find_photos, only: [:index]
  before_filter :find_tags, only: [:index]
  before_filter :find_photo, only: [:show, :update, :destroy]

  def new
    @photo = current_user.photos.build
  end

  def create
    @photo = current_user.photos.create(params[:photo])
    respond_with @photo
  end

  private

  def find_photo
    @photo = Photo.find_by_code!(params[:id])
  end

  def find_track
    @track = Track.find_by_code(params[:track_id])
  end

  def find_photos
    unless @tag || @track
      authenticate_user!
    end
    if user_signed_in?
      @all_photos = current_user.photos
      @photos = @all_photos.date_ordered
    end
    if @tag
      @photos = @tag.photos.date_ordered
    end
    if @track
      @photos = @track.user.photos.within(@track) if @track
    end
  end

  def find_tag
    @tag = Tag.find_by_code!(params[:tag_id]) if params[:tag_id]
  end

  def find_tags
    unless @tag || @track
      authenticate_user!
    end
    @tags = current_user.tags if user_signed_in?
  end

end
