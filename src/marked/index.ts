import { ampMathmlRenderer } from "./amp-mathml";
import { render } from "preact";
import { katexExt } from "./katex";
import md from "marked";

md.use({
  //@ts-ignore
  extensions: [{ ...katexExt, renderer: ampMathmlRenderer }],
});
export const marked = (s: string) => md(s);
