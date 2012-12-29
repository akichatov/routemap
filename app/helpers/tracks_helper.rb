module TracksHelper

  def format_distance(value)
    number_to_human(value, units: {unit: t('views.units.metre'), thousand: t('views.units.kilometre')}, precision: 2, separator: '.', significant: false, strip_insignificant_zeros: false)
  end

  def format_time_diff(value)
    "#{value / 3600}:#{'%02d' % ((value / 60) % 60)}"
  end

  def format_time_diff_hms(value)
    hours = value / 3600
    minutes = (value / 60) % 60
    seconds = value % 60
    result = ""
    if hours > 0
      result += "#{hours} #{t('views.units.hour')} "
    end
    if minutes > 0
      result += "#{minutes} #{t('views.units.minute')} "
    end
    if hours + minutes == 0
      result += "#{seconds} #{t('views.units.second')} "
    end
    result
  end

  def format_speed(value)
    "#{value} #{t('views.units.kilometre_per_hour')}"
  end

  def track_date(track)
    start_date = track.statistic.start_date.in_time_zone(track.timezone)
    end_date = track.statistic.end_date.in_time_zone(track.timezone)
    format_date_interval(start_date, end_date)
  end

  def format_date_interval(start_date, end_date)
    result = ""
    if start_date.year == end_date.year
      result += start_date.strftime("%Y ")
      if start_date.month == end_date.month && start_date.day == end_date.day
        result += start_date.strftime("%b %e ")
        result += start_date.strftime("%H:%M - ")
        result += end_date.strftime("%H:%M ")
      else
        result += start_date.strftime("%b %e %H:%M - ")
        result += end_date.strftime("%b %e %H:%M ")
      end
    else
      result += start_date.strftime("%Y %b %e %H:%M - ")
      result += end_date.strftime("%Y %b %e %H:%M ")
    end
    result
  end

end
