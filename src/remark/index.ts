import Remark from "remark";
import html from "remark-html";
import gfm from "remark-gfm";
import math from "remark-math";
import remark2rehype from "remark-rehype";
import katex from "rehype-katex";
import stringify from "rehype-stringify";

export const remark = (s: string) =>
  Remark()
    .use(gfm)
    .use(math)
    .use(remark2rehype)
    .use(katex)
    .use(stringify)
    .process(s)
    .then((f) => String(f));