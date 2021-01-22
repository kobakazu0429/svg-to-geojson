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

function simplyCoords(path, scale, translateX, translateY) {
  console.log(path);
  const pathString = xml2string(path);
  console.log(pathString);
  const svg = parse(pathString);
  console.log(svg);

  if (svg.children.length === 0) return null;

  const { d } = parse(pathString).children[0].properties;
  const parsed = SVGPath.parse(d);

  if (parsed.curveshapes.length === 0 && parsed.current.points.length === 0) return null;

  const points = parsed.curveshapes.length > 0
    ? parsed.curveshapes[0].points?.map(({ main }) => ({ x: main.x, y: main.y }))
    : parsed.current.points.map(({ main }) => ({ x: main.x, y: main.y }));

  if (!isAngularShape(points)) return null;

  return points.map((p) => [p.x * scale + translateX, p.y * scale + translateY])
}

function pathToCoords(path, scale, numPoints, translateX, translateY) {
  const result = simplyCoords(path, scale, translateX, translateY);

  if (result !== null) return {
    path,
    coords: result
  };

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

export { pathToCoords };
