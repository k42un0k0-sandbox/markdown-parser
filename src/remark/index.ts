import Remark from "remark";
import gfm from "remark-gfm";
import math from "remark-math";
import remark2rehype from "remark-rehype";
import katex from "rehype-katex";
import stringify from "rehype-stringify";
import { ampMathml } from "./amp-mathml";

export const remark = (s: string) =>
  Remark()
    .use(gfm)
    .use(math)
    .use(ampMathml)
    .use(remark2rehype)
    // .use(katex)
    .use(stringify)
    .process(s)
    .then((f) => String(f));
