module SplitStrategy
  class Base

    def split!(track)
      process(track.version.to_hash[:points], track)
    end

  end
end
