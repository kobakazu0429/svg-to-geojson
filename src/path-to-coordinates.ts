import * as SVGPath from "js-svg-path";
import { UpdateElementNode, Node as SVGParserNode, parse } from "svg-parser";

function isAngularShape(points: { x: number; y: number }[]): boolean {
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[i - 1];
    if (!(p1.x === p2.x || p1.y === p2.y)) {
      return false;
    }
  }
  return true;
}

function xml2string(node: Node): string {
  if (typeof XMLSerializer !== "undefined") {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(node);
  } else {
    throw Error("unknown node");
  }
}

function isElement(node: SVGParserNode): node is UpdateElementNode {
  return node.type === "element";
}

function simplyCoords(
  path: SVGPathElement,
  scale: number,
  translateX: number,
  translateY: number
): [number, number][] | null {
  const pathString = xml2string(path);
  // const svg = parse(pathString);
  // if (svg.children.length === 0) return null;
  const node = parse(pathString).children[0];
  if (!isElement(node)) return null;
  if (!node.properties?.d) return null;

  const { d } = node.properties;

  // js-svg-path is not supported `s`
  // https://github.com/Pomax/js-svg-path/issues/1
  if (d.includes("s")) return null;

  const parsed = SVGPath.parse(d);

  if (parsed.curveshapes.length === 0 && parsed.current.points.length === 0)
    return null;

  const points =
    parsed.curveshapes.length > 0
      ? parsed.curveshapes[0].points.map(({ main }) => ({
          x: main.x,
          y: main.y,
        }))
      : parsed.current.points.map(({ main }) => ({ x: main.x, y: main.y }));

  if (!isAngularShape(points)) return null;

  return points.map((p) => [
    p.x * scale + translateX,
    p.y * scale + translateY,
  ]);
}

export interface Coord {
  path: SVGPathElement;
  coords: [number, number][];
}

function pathToCoords(
  path: SVGPathElement,
  numPoints: number,
  scale: number,
  translateX: number,
  translateY: number
): Coord {
  const result = simplyCoords(path, scale, translateX, translateY);

  if (result !== null)
    return {
      path,
      coords: result,
    };

  const length = path.getTotalLength();
  const getRange = [...new Array(numPoints).keys()];
  // Always include the max value in the range.
  // This is helpful for detecting closed polygons vs lines

  getRange.push(numPoints);

  return {
    path,
    coords: getRange.map((i) => {
      const point = path.getPointAtLength((length * i) / numPoints);
      return [point.x * scale + translateX, point.y * scale + translateY];
    }),
  };
}

export { pathToCoords };
