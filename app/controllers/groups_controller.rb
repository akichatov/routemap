class GroupsController < ApplicationController

  before_filter :find_tag, only: [:show]

  private

  def find_tag
    @tag = Tag.find_by_code!(params[:id])
  end

end