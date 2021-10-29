import type * as ESTree from "estree";



/**
 * 从ast中提取出参数
 */
export function extractParams(
  ast: ESTree.Program
): ESTree.VariableDeclaration[] {
  const params: ESTree.VariableDeclaration[] = [];
  ast.body.forEach((node: ESTree.Node) => {
    if (node.type === "VariableDeclaration") {
      const decl = node as ESTree.VariableDeclaration;
      if (decl.kind === "const") {
        params.push(decl);
      }
    }
  });
  return params;
}

/**
 * 匹配两个ast中的参数
 */
export function matchParams(
  ast1: ESTree.Program,
  ast2: ESTree.Program
): boolean {
  const params1 = extractParams(ast1);
  const params2 = extractParams(ast2);
  if (params1.length !== params2.length) {
    return false;
  }
  for (let i = 0; i < params1.length; i++) {
    if (
      // params1[i].declarations[0].id.name !== params2[i].declarations[0].id.name
      true
    ) {
      return false;
    }
  }
  return true;
}
