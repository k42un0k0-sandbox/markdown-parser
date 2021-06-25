import { Node, Parent, Position } from "unist";
import visit from "unist-util-visit";

export function ampMathml() {
  return transformer;

  function transformToJsxNode(
    parent: Parent | undefined,
    index: number,
    value: string,
    position: Position | undefined
  ) {
    const newNode = {
      type: "jsx",
      value: value,
      position: position,
    };

    if (parent != null) parent.children[index] = newNode;
  }

  function transformer(ast: Node) {
    visit(ast, "math", mathVisitor);
    function mathVisitor(
      node: Node,
      index: number,
      parent: Parent | undefined
    ): void {
      const value = `<amp-mathml layout="container" data-formula="\\[${node.value}\\]" />`;
      transformToJsxNode(parent, index, value, node.position);
    }

    visit(ast, "inlineMath", inlineMathVistor);
    function inlineMathVistor(
      node: Node,
      index: number,
      parent: Parent | undefined
    ): void {
      const value = `<amp-mathml
                            layout="container"
                            inline
                            data-formula="\\[${node.value}\\]"
                            />`;
      transformToJsxNode(parent, index, value, node.position);
    }
  }
}
