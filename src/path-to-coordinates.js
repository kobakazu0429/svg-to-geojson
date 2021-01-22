import * as SVGPath from "js-svg-path"
import { parse } from 'svg-parser';

function isAngularShape(points) {
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[i - 1];
    if (!(p1.x === p2.x || p1.y === p2.y)) {
      return false;
    }
  }
  return true;
}

function xml2string(node) {
  if (typeof (XMLSerializer) !== 'undefined') {
    var serializer = new XMLSerializer();
    return serializer.serializeToString(node);
  } else if (node.xml) {
    return node.xml;
  }
}

function pathToCoords(path, scale, numPoints, translateX, translateY) {
  const pathString = xml2string(path);
  const { d } = parse(pathString).children[0].properties;
  const parsed = SVGPath.parse(d);
  const points = parsed.curveshapes.length > 0
    ? parsed.curveshapes[0].points?.map(({ main }) => ({ x: main.x, y: main.y }))
    : parsed.current.points.map(({ main }) => ({ x: main.x, y: main.y }));

  if (isAngularShape(points)) {
    return {
      path,
      coords: points.map((point) => {
        return [point.x * scale + translateX, point.y * scale + translateY];
      })
    }
  } else {
    const length = path.getTotalLength();
    const getRange = [... new Array(numPoints).keys()];
    // Always include the max value in the range.
    // This is helpful for detecting closed polygons vs lines
    getRange.push(numPoints);

    return {
      path,
      coords: getRange.map((i) => {
        const point = path.getPointAtLength(length * i / numPoints);
        return [point.x * scale + translateX, point.y * scale + translateY];
      })
    }
  }
}

export { pathToCoords };
