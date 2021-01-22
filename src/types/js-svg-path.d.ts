declare module "js-svg-path" {
  interface Point {
    main: {
      x: number;
      y: number;
    };
  }

  export function parse(
    path: string
  ): {
    curveshapes: { points: Point[] }[];
    current: { points: Point[] };
  };
}
