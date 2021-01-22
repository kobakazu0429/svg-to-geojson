function pathToCoords(path, scale, numPoints, translateX, translateY) {
  const length = path.getTotalLength();
  const getRange = [... new Array(numPoints).keys()];
  // Always include the max value in the range.
  // This is helpful for detecting closed polygons vs lines
  getRange.push(numPoints);

  return {
    path,
    coords: getRange.map(function (i) {
      const point = path.getPointAtLength(length * i / numPoints);
      return [point.x * scale + translateX, point.y * scale + translateY];
    })
  }


}

export { pathToCoords };
