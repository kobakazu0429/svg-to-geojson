import { ElementNode as EN } from "svg-parser";
export { TextNode, Node, RootNode } from "svg-parser";

declare module "svg-parser" {
  export interface UpdateElementNode extends Omit<EN, "properties"> {
    type: "element";
    tagName?: string;
    properties?: {
      d: string;
    };
    children: Array<Node | string>;
    value?: string;
    metadata?: string;
  }
}
