import MarkdownIt from "markdown-it";
import { rules } from "./katex";
export function ampMathml(md: MarkdownIt) {
  for (const rule of rules.inline) {
    md.renderer.rules[rule.name] = (tokens, idx) =>
      `<amp-mathml inline layout="container" data-fomula="${
        tokens[idx].markup + tokens[idx].content + tokens[idx].markup
      }"></amp-mathml>`;
  }

  for (const rule of rules.block) {
    md.renderer.rules[rule.name] = (tokens, idx) =>
      `<amp-mathml layout="container" data-fomula="${
        tokens[idx].markup + tokens[idx].content + tokens[idx].markup
      }"></amp-mathml>`;
  }
}
