import type * as ESTree from "estree";
const esprima = require("esprima");

export type FunctionNode =
  | ESTree.FunctionDeclaration
  | ESTree.FunctionExpression
  | ESTree.ArrowFunctionExpression
  | ESTree.NewExpression;
class AST {
  private ast: ESTree.Program;
  constructor(code: string | ESTree.Program) {
    if (typeof code === "string") {
      this.ast = esprima.parseScript(code);
    } else {
      this.ast = code;
    }
  }

  public getAST(): ESTree.Program {
    return this.ast;
  }

  /**
   * 从 ast 中抽取出所有的函数
   * 包括函数声明、函数表达式、箭头函数
   * @returns {FunctionNode[]}
   */
  public extractFunction(): FunctionNode[] {
    const functions: FunctionNode[] = [];
    const walk = (node: ESTree.Node) => {
      if (
        [
          "FunctionDeclaration",
          "FunctionExpression",
          "ArrowFunctionExpression",
        ].includes(node.type)
      ) {
        functions.push(node as FunctionNode);
      } else if (node.type === "Program") {
        node.body.forEach(walk);
      } else if (node.type === "BlockStatement") {
        node.body.forEach(walk);
      } else if (node.type === "ExpressionStatement") {
        walk(node.expression);
      } else if (node.type === "CallExpression") {
        walk(node.callee);
        node.arguments.forEach(walk);
      } else if (node.type === "MemberExpression") {
        walk(node.object);
        walk(node.property);
      } else if (
        node.type === "NewExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "Function"
      ) {
        functions.push(node);
      }
    };
    walk(this.ast);
    return functions;
  }
}
