/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-expect-error
import { SVGO } from "libsvgo/module/lib/svgo";
// @ts-expect-error
import * as removeDoctype from "libsvgo/module/plugins/removeDoctype";
// @ts-expect-error
import * as removeXMLProcInst from "libsvgo/module/plugins/removeXMLProcInst";
// @ts-expect-error
import * as removeComments from "libsvgo/module/plugins/removeComments";
// @ts-expect-error
import * as removeMetadata from "libsvgo/module/plugins/removeMetadata";
// @ts-expect-error
import * as removeXMLNS from "libsvgo/module/plugins/removeXMLNS";
// @ts-expect-error
import * as removeEditorsNSData from "libsvgo/module/plugins/removeEditorsNSData";
// @ts-expect-error
import * as cleanupAttrs from "libsvgo/module/plugins/cleanupAttrs";
// @ts-expect-error
import * as inlineStyles from "libsvgo/module/plugins/inlineStyles";
// @ts-expect-error
import * as minifyStyles from "libsvgo/module/plugins/minifyStyles";
// @ts-expect-error
import * as convertStyleToAttrs from "libsvgo/module/plugins/convertStyleToAttrs";
// @ts-expect-error
import * as removeRasterImages from "libsvgo/module/plugins/removeRasterImages";
// @ts-expect-error
import * as removeUselessDefs from "libsvgo/module/plugins/removeUselessDefs";
// @ts-expect-error
import * as cleanupNumericValues from "libsvgo/module/plugins/cleanupNumericValues";
// @ts-expect-error
import * as cleanupListOfValues from "libsvgo/module/plugins/cleanupListOfValues";
// @ts-expect-error
import * as convertColors from "libsvgo/module/plugins/convertColors";
// @ts-expect-error
import * as removeUnknownsAndDefaults from "libsvgo/module/plugins/removeUnknownsAndDefaults";
// @ts-expect-error
import * as removeNonInheritableGroupAttrs from "libsvgo/module/plugins/removeNonInheritableGroupAttrs";
// @ts-expect-error
import * as removeUselessStrokeAndFill from "libsvgo/module/plugins/removeUselessStrokeAndFill";
// @ts-expect-error
import * as removeViewBox from "libsvgo/module/plugins/removeViewBox";
// @ts-expect-error
import * as cleanupEnableBackground from "libsvgo/module/plugins/cleanupEnableBackground";
// @ts-expect-error
import * as removeHiddenElems from "libsvgo/module/plugins/removeHiddenElems";
// @ts-expect-error
import * as removeEmptyText from "libsvgo/module/plugins/removeEmptyText";
// @ts-expect-error
import * as moveElemsAttrsToGroup from "libsvgo/module/plugins/moveElemsAttrsToGroup";
// @ts-expect-error
import * as moveGroupAttrsToElems from "libsvgo/module/plugins/moveGroupAttrsToElems";
// @ts-expect-error
import * as collapseGroups from "libsvgo/module/plugins/collapseGroups";
// @ts-expect-error
import * as convertPathData from "libsvgo/module/plugins/convertPathData";
// @ts-expect-error
import * as convertTransform from "libsvgo/module/plugins/convertTransform";
// @ts-expect-error
import * as removeEmptyAttrs from "libsvgo/module/plugins/removeEmptyAttrs";
// @ts-expect-error
import * as removeEmptyContainers from "libsvgo/module/plugins/removeEmptyContainers";
// @ts-expect-error
import * as mergePaths from "libsvgo/module/plugins/mergePaths";
// @ts-expect-error
import * as removeUnusedNS from "libsvgo/module/plugins/removeUnusedNS";
// @ts-expect-error
import * as sortAttrs from "libsvgo/module/plugins/sortAttrs";
// @ts-expect-error
import * as removeTitle from "libsvgo/module/plugins/removeTitle";
// @ts-expect-error
import * as removeDesc from "libsvgo/module/plugins/removeDesc";
// @ts-expect-error
import * as removeDimensions from "libsvgo/module/plugins/removeDimensions";
// @ts-expect-error
import * as removeStyleElement from "libsvgo/module/plugins/removeStyleElement";
// @ts-expect-error
import * as removeScriptElement from "libsvgo/module/plugins/removeScriptElement";

const plugins = [
  cleanupAttrs,
  cleanupEnableBackground,
  cleanupListOfValues,
  cleanupNumericValues,
  collapseGroups,
  convertColors,
  convertPathData,
  convertStyleToAttrs,
  convertTransform,
  inlineStyles,
  mergePaths,
  minifyStyles,
  moveElemsAttrsToGroup,
  moveGroupAttrsToElems,
  removeComments,
  removeDesc,
  removeDimensions,
  removeDoctype,
  removeEditorsNSData,
  removeEmptyAttrs,
  removeEmptyContainers,
  removeEmptyText,
  removeHiddenElems,
  removeMetadata,
  removeNonInheritableGroupAttrs,
  removeRasterImages,
  removeScriptElement,
  removeStyleElement,
  removeTitle,
  removeUnknownsAndDefaults,
  removeUnusedNS,
  removeUselessDefs,
  removeUselessStrokeAndFill,
  removeViewBox,
  removeXMLNS,
  removeXMLProcInst,
  sortAttrs,
].map((v) => ({ ...v, active: true }));

export async function svgo(svg: string): Promise<string> {
  const svgo = new SVGO({ plugins: plugins });
  const optimized = await svgo.optimize(svg);
  return optimized.data;
}
