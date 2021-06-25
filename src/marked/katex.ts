import md from "marked";
import katex from "katex";

export const katexExt = {
  name: "katex",
  renderer: (token: any) => {
    try {
      let html = katex.renderToString(token.text, {
        displayMode: token.displayMode,
      });

      return html;
    } catch (e: unknown) {
      console.error(e);
      return token.raw;
    }
  },
  level: "inline",
  start: (a: string) => a.indexOf("$"),
  tokenizer: (a: any, b: any[]) => {
    const blockRegex = /^\$\$[^\$]*\$\$/;
    let blockExprArray = a.match(blockRegex);
    if (blockExprArray != null) {
      for (let expr of blockExprArray) {
        console.log(expr);
        const token = {
          type: "katex",
          raw: expr,
          displayMode: true,
          text: expr.slice(2, expr.length - 2),
        };
        if (b.find((b) => b.raw === token.raw)) return;
        return token;
      }
    }
    const inlineRegex = /^\$[^\$]*\$/;
    let inlineExprArray = a.match(inlineRegex);
    if (inlineExprArray == null) return;
    for (let expr of inlineExprArray) {
      console.log(expr);
      const token = {
        type: "katex",
        raw: expr,
        text: expr.slice(1, expr.length - 1),
      };
      if (b.find((b) => b.raw === token.raw)) return;
      return token;
    }
  },
  childTokens: ["katex"],
};
