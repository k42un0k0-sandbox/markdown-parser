import katex from "katex";
import MarkdownIt from "markdown-it";
import StateBlock from "markdown-it/lib/rules_block/state_block";
import StateInline from "markdown-it/lib/rules_inline/state_inline";
export function katexExt(md: MarkdownIt) {
  for (const rule of rules.inline) {
    md.inline.ruler.before("escape", rule.name, katexExt.inline(rule)); // ! important
    md.renderer.rules[rule.name] = (tokens, idx) =>
      rule.tmpl.replace(
        /\$1/,
        katexExt.render(tokens[idx].content, !!rule.displayMode)
      );
  }

  for (const rule of rules.block) {
    md.block.ruler.before("fence", rule.name, katexExt.block(rule)); // ! important for ```math delimiters
    md.renderer.rules[rule.name] = (tokens, idx) =>
      rule.tmpl
        .replace(/\$2/, tokens[idx].info) // equation number .. ?
        .replace(/\$1/, katexExt.render(tokens[idx].content, true));
  }
}

// katexExt.inline = (rule) => dollar;  // just for debugging/testing ..

katexExt.inline = (rule: Rule) =>
  function (state: StateInline, silent: boolean) {
    const pos = state.pos;
    const str = state.src;
    const pre =
      str.startsWith(rule.tag, (rule.rex.lastIndex = pos)) &&
      (!rule.pre || rule.pre(str, rule.outerSpace, pos)); // valid pre-condition ...
    const match = pre && rule.rex.exec(str);
    const res =
      !!match &&
      pos < rule.rex.lastIndex &&
      (!rule.post || rule.post(str, rule.outerSpace, rule.rex.lastIndex - 1));

    if (match == null || !match) return false;

    if (res) {
      if (!silent) {
        const token = state.push(rule.name, "math", 0);
        token.content = match[1];
        token.markup = rule.tag;
      }
      state.pos = rule.rex.lastIndex;
    }
    return res;
  };

katexExt.block = (rule: Rule) =>
  function block(
    state: StateBlock,
    begLine: number,
    endLine: number,
    silent: boolean
  ): boolean {
    const pos = state.bMarks[begLine] + state.tShift[begLine];
    const str = state.src;
    const pre =
      str.startsWith(rule.tag, (rule.rex.lastIndex = pos)) &&
      (!rule.pre || rule.pre(str, false, pos)); // valid pre-condition ....
    const match = pre && rule.rex.exec(str);
    const res =
      !!match &&
      pos < rule.rex.lastIndex &&
      (!rule.post || rule.post(str, false, rule.rex.lastIndex - 1));

    if (match == null || !match) return false;

    if (res && !silent) {
      // match and valid post-condition ...
      const endpos = rule.rex.lastIndex - 1;
      let curline;

      for (curline = begLine; curline < endLine; curline++)
        if (
          endpos >= state.bMarks[curline] + state.tShift[curline] &&
          endpos <= state.eMarks[curline]
        )
          // line for end of block math found ...
          break;

      // "this will prevent lazy continuations from ever going past our end marker"
      // s. https://github.com/markdown-it/markdown-it-container/blob/master/index.js
      const lineMax = state.lineMax;
      const parentType = state.parentType;
      state.lineMax = curline;

      if (parentType === "blockquote")
        // remove all leading '>' inside multiline formula
        match[1] = match[1].replace(/(\n*?^(?:\s*>)+)/gm, "");
      // begin token
      let token = state.push(rule.name, "math", 1); // 'math_block'
      token.block = true;
      token.markup = rule.tag;
      token.content = match[1];
      token.info = match[match.length - 1]; // eq.no
      token.map = [begLine, curline];
      // end token
      token = state.push(rule.name + "_end", "math", -1);
      token.block = true;
      token.markup = rule.tag;

      state.parentType = parentType;
      state.lineMax = lineMax;
      state.line = curline + 1;
    }
    return res;
  };

katexExt.render = function (tex: string, displayMode: boolean) {
  const options = { displayMode };
  let res;
  try {
    res = katex.renderToString(tex, options);
  } catch (err) {
    res = `${tex}:${err.message}`
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  return res;
};

// used for enable/disable math rendering by `markdown-it`
katexExt.inlineRuleNames = ["math_inline", "math_inline_double"];
katexExt.blockRuleNames = ["math_block", "math_block_eqno"];

katexExt.$_pre = (
  str: string,
  outerSpace: boolean | undefined,
  beg: number
) => {
  const prv = beg > 0 ? str[beg - 1].charCodeAt(0) : false;
  return outerSpace
    ? !prv || prv === 0x20 // space  (avoiding regex's for performance reasons)
    : !prv ||
        (prv !== 0x5c && // no backslash,
          (prv < 0x30 || prv > 0x39)); // no decimal digit .. before opening '$'
};
katexExt.$_post = (
  str: string,
  outerSpace: boolean | undefined,
  end: number
) => {
  const nxt = str[end + 1] && str[end + 1].charCodeAt(0);
  return outerSpace
    ? !nxt ||
        nxt === 0x20 || // space  (avoiding regex's for performance reasons)
        nxt === 0x2e || // '.'
        nxt === 0x2c || // ','
        nxt === 0x3b // ';'
    : !nxt || nxt < 0x30 || nxt > 0x39; // no decimal digit .. after closing '$'
};

type Rule = {
  name: string;
  rex: RegExp;
  tmpl: string;
  tag: string;
  displayMode?: boolean;
  outerSpace?: boolean;
  pre?: (str: string, outerSpace: boolean | undefined, beg: number) => boolean;
  post?: (str: string, outerSpace: boolean | undefined, end: number) => boolean;
};
const rules = {
  inline: [
    {
      name: "math_inline_double",
      rex: /\${2}((?:\S)|(?:\S.*?\S))\${2}/gy,
      tmpl: "<section><eqn>$1</eqn></section>",
      tag: "$$",
      displayMode: true,
      pre: katexExt.$_pre,
      post: katexExt.$_post,
    },
    {
      name: "math_inline",
      rex: /\$((?:\S)|(?:\S.*?\S))\$/gy,
      tmpl: "<eq>$1</eq>",
      tag: "$",
      pre: katexExt.$_pre,
      post: katexExt.$_post,
    },
  ],
  block: [
    {
      name: "math_block_eqno",
      rex: /\${2}([^$]+?)\${2}\s*?\(([^)\s]+?)\)/gmy,
      tmpl: '<section class="eqno"><eqn>$1</eqn><span>($2)</span></section>',
      tag: "$$",
    },
    {
      name: "math_block",
      rex: /\${2}([^$]+?)\${2}/gmy,
      tmpl: "<section><eqn>$1</eqn></section>",
      tag: "$$",
    },
  ],
};
