module SplitStrategy
  class Base

    def split!(version)
      process(version.to_hash[:points])
    end

  end
end
