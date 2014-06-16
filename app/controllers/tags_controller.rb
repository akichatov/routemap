class TagsController < ApplicationController

  before_filter :find_tag, only: [:show]

  private

  def find_tag
    ids = params[:id].split(',')
    if ids.size > 1
      @tag = Tag.new(name: 'tracks', code: params[:id], tracks: Track.joins(:tags).where("tags.code IN (?)", ids).start_at_ordered)
    else
      @tag = Tag.find_by_code!(ids)
    end
  end

end