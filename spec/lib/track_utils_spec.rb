require 'spec_helper'

describe TrackUtils do
  describe "simplify" do
    before do
      @points = [ {ele: 3, fdist: 0},
                  {ele: 1, fdist: 2},
                  {ele: 2, fdist: 3},
                  {ele: 0, fdist: 5},
                  {ele: 1, fdist: 6},
                  {ele: 0, fdist: 7},
                  {ele: 2, fdist: 9},
                  {ele: 1, fdist: 10},
                  {ele: 3, fdist: 12}]
    end
    it "reduces points which are closer than epsilon" do
      simplified = TrackUtils.simplify(@points, epsilon: 2, x: :fdist, y: :ele)
      simplified.size.should == 3
      simplified.first.should == {ele: 3, fdist: 0}
      simplified.second.should == {ele: 0, fdist: 5}
      simplified.last.should == {ele: 3, fdist: 12}
    end
  end
end
