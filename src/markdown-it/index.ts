import md from "markdown-it";
import { katexExt } from "./katex";
export const markdownIt = (s: string) => md().use(katexExt).render(s);
