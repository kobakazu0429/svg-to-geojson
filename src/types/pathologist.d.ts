declare module "pathologist/dist/index.modern" {
  export function transform(path: string): string;
  export function parse(
    path: string
  ): {
    paths: Record<string, string>[];
    toString(): string;
  };
}
