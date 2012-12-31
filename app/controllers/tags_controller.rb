class TagsController < ApplicationController

  before_filter :find_tag, only: [:show]

  private

  def find_tag
    ids = params[:id].split(',')
    if ids.size > 1
      @tag = Tag.new(name: 'tracks', code: params[:id])
      @tag.tracks = Track.where(code: ids)
    else
      @tag = Tag.find_by_code!(params[:id])
    end
  end

end