import { katexExt } from "./katex";
import md from "marked";

md.use({
  //@ts-ignore
  extensions: [katexExt],
});
export const marked = (s: string) => md(s);
