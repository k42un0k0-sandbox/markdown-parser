import md from "markdown-it";
export const markdownIt = (s: string) => md().render(s);
