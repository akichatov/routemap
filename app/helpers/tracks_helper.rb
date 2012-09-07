module TracksHelper

  def format_distance(value)
    number_to_human(value, units: {unit: 'm', thousand: 'km'}, precision: 2, significant: false, strip_insignificant_zeros: false)
  end

end
