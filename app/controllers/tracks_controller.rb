class TracksController < ApplicationController
  respond_to :html, :js, :gpx

  before_filter :authenticate_user!, except: [:show]
  before_filter :find_tag
  before_filter :find_tags, only: [:index, :create]
  before_filter :find_per_page, only: [:index, :create]
  before_filter :find_tracks, only: [:index, :create]
  before_filter :find_track, only: [:edit, :update, :destroy, :slice, :save_slice]
  before_filter :setup_new_track, only: [:index, :new]

  def multi_view
    redirect_to tracks_path and return unless params[:tracks]
    redirect_to track_path(id: params[:tracks].join(','))
  end

  def slice
    if params[:excludes] && params[:excludes].size > 0
      @track.version.without(params[:excludes], true)
    end
  end

  def save_slice
    if params[:excludes] && params[:excludes].size > 0
      @track.version.without(params[:excludes]).save!
    end
    render nothing: true
  end

  def create
    @track = current_user.tracks.build(params[:track])
    if @track.save
      redirect_to @track.many_days? ? new_track_partition_path(@track) : tracks_path, notice: t('views.tracks.messages.created')
    else
      render action: :new
    end
  end

  def show
    ids = params[:id].split(',')
    if ids.size > 1
      @tag = Tag.new({name: 'tracks', code: params[:id], tracks: Track.where(code: ids).start_at_ordered}, without_protection: true)
      render 'tags/show'
    else
      @track = Track.find_by_code!(ids.first)
      respond_with(@track)
    end
  end

  def update
    if @track.update_attributes(params[:track])
      redirect_to tracks_path, notice: t('views.tracks.messages.updated')
    else
      render action: "edit"
    end
  end

  def destroy
    @track.destroy
    redirect_to tracks_path, notice: t('views.tracks.messages.deleted')
  end

private

  def find_tag
    @tag = current_user.tags.find_by_code!(params[:tag_id]) if params[:tag_id]
  end

  def find_tags
    @tags = current_user.tags.order(:name)
  end

  def find_per_page
    @page = (params[:page] || 1).to_i
    @per_page = (params[:per_page] || cookies[:tracks_per_page] || 20).to_i
    cookies[:tracks_per_page] = @per_page
  end

  def find_tracks
    @all_tracks = @tracks = current_user.tracks.ordered
    if @tag
      @tracks = @tag.tracks.ordered
    end
    @tracks_size = @tracks.size
    @tracks = @tracks.page(@page).per(@per_page)
  end

  def find_track
    @track = current_user.tracks.find_by_code!(params[:id])
  end

  def setup_new_track
    @track = current_user.tracks.build
  end

end
