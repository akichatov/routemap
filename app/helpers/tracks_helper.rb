module TracksHelper

  def format_distance(value)
    number_to_human(value, units: {unit: t('views.units.metre'), thousand: t('views.units.kilometre')}, precision: 2, separator: '.', significant: false, strip_insignificant_zeros: false)
  end

  def format_time_diff(value)
    "#{(value / 60) / 60}:#{'%02d' % ((value / 60) % 60)}"
  end

  def format_speed(value)
    "#{value} #{t('views.units.kilometre_per_hour')}"
  end

end
