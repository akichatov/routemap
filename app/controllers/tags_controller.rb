class TagsController < ApplicationController
  before_filter :authenticate_user!, except: [:show]

  before_filter :find_tags, only: :show
  before_filter :find_tag, only: [:edit, :update]

  def update
    if @tag.update_attributes(params[:tag])
      redirect_to tag_tracks_path(@tag)
    else
      render :edit
    end
  end

  private

  def find_tags
    ids = params[:id].split(',')
    if ids.size > 1
      @tag = Tag.new({
        name: 'tracks',
        code: params[:id],
        tracks: Track.joins(:tags).where("tags.code IN (?)", ids).start_at_ordered
      }, without_protection: true)
    else
      @tag = Tag.find_by_code!(ids)
    end
  end

  def find_tag
    @tag = current_user.tags.find_by_code!(params[:id])
  end

end
