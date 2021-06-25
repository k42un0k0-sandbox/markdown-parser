import md from "markdown-it";
import { ampMathml } from "./amp-mathml";
import { katexExt } from "./katex";
export const markdownIt = (s: string) =>
  md().use(katexExt).use(ampMathml).render(s);
