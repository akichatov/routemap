module TracksHelper

  def format_distance(value)
    number_to_human(value, units: {unit: t('views.units.metre'), thousand: t('views.units.kilometre')}, precision: 2, separator: '.', significant: false, strip_insignificant_zeros: false)
  end

end
