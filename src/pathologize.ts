import { parse } from "pathologist/dist/index.modern";

function pathologize(svg: string): Promise<string> {
  const expression = /<(text|style|metadata|pattern)[\s\S]*?<\/(text|style|metadata|pattern)>/g;
  const clean = svg.replace(expression, "");

  return new Promise((resolve, reject) => {
    const parsed = parse(clean);

    parsed.paths = parsed.paths.map((path) => {
      delete path["stroke-linecap"];
      delete path["stroke-linejoin"];
      delete path["stroke-miterlimit"];
      delete path["stroke-width"];
      return path;
    });

    const transformed = parsed.toString();
    if (!transformed) return reject(svg);
    resolve(transformed);
  });
}

export { pathologize };
