module TrackUtils
  def self.simplify(points, options={})
    do_simplify(points, options)
  end

  # Ramer Douglas Peucker
  def self.do_simplify(points, options)
    epsilon = options[:epsilon] || 1
    index = dmax = 0
    1.upto(points.size - 2) do |i|
      d = orthogonal_distance(points[i], points[0], points[-1], options)
      index, dmax = i, d if d > dmax
    end
    if dmax > epsilon
      sub_list_left = do_simplify(points[0..index], options)
      sub_list_right = do_simplify(points[index..-1], options)
      sub_list_left[0..-2] + sub_list_right[0..-1]
    else
      [points[0], points[-1]]
    end
  end

  def self.orthogonal_distance(point, head, tail, options={})
    x, y = options[:x] || 0, options[:y] || 1
    return (head[x] - point[x]).abs if head[x] == tail[x]
    return (head[y] - point[y]).abs if head[y] == tail[y]
    dx = head[x] - tail[x]
    dy = head[y] - tail[y]
    return 0.0 if dx.zero? && dy.zero?
    (dy * point[x] - dx * point[y] + head[x] * tail[y] - head[y] * tail[x]).abs / Math.sqrt(dx ** 2 + dy ** 2)
  end

end
