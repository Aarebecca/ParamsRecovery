import _ from "lodash";
import generate from "@babel/generator";
import { each, isObject, isString } from "@antv/util";
import { extractArgumentNamesList, extractVariableNamesList } from "./extract";
import { isFunctionAvailable } from "./drop";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { comparer } from "./utils";
/**
 * 抽象语法树 ast 的解析及函数定义提取
 */
import type { FunctionNode } from "./types";
import type {
  File as AST_TYPE,
  StringLiteral,
  Node,
  FunctionExpression,
  ExpressionStatement,
} from "@babel/types";

export class AST {
  public raw: string;
  public ast!: AST_TYPE;

  constructor(code: string | AST_TYPE) {
    this.raw = isString(code) ? code : AST.generate(code);
    this.reload(code);
  }

  /**
   * 解析代码为 ast
   */
  public static parse(code: string): AST_TYPE {
    try {
      return parse(code);
    } catch (es) {
      // try parse as module
      try {
        return parse(code, {
          sourceType: "module",
          plugins: ["jsx", "flow"],
        });
      } catch (em) {
        throw new Error(`parse error: ${em}`);
      }
    }
  }

  public static generate(code: Node) {
    return generate(code).code;
  }

  /**
   * code string
   */
  public get code() {
    return generate(this.ast);
  }

  /**
   * 获得 ast 中所有的函数定义节点
   * 包括函数声明、函数表达式、箭头函数
   */
  public get functions(): FunctionNode[] {
    const funcs: FunctionNode[] = [];
    const walk = (node: Node) => {
      each(node, (val: Node, key: string) => {
        if (isObject(val)) {
          if (
            [
              "FunctionDeclaration",
              "FunctionExpression",
              "ArrowFunctionExpression",
            ].includes(val.type)
          ) {
            funcs.push(val as FunctionNode);
          } else if (
            val.type === "NewExpression" &&
            val.callee.type === "Identifier" &&
            val.callee.name === "Function"
          ) {
            /**
             * 如果使用 new Function 来构造函数
             * 将其转化为 FunctionExpression
             */
            // 构造 function
            const params = val.arguments
              .slice(0, -1)
              .map((arg) => (arg as StringLiteral).value);
            const f = `(function (${params.join(",")}){ ${
              (val.arguments.slice(-1)[0] as StringLiteral).value
            } })`;
            funcs.push(
              (AST.parse(f).program.body[0] as ExpressionStatement)
                .expression as FunctionExpression
            );
          }
          walk(val);
        }
      });
    };
    walk(this.ast.program);
    return funcs;
  }

  /**
   * 获得可用的function
   */
  public get availableFunctions() {
    return this.functions.filter(isFunctionAvailable);
  }

  /**
   * 代码规范化
   */
  public get normalizeFunctionsIdentifier() {
    /**
     * 1. 命名使用驼峰法
     * 2. 统一放置变量定义
     */
    const { availableFunctions: functions } = this;
    return functions.map((func) => {
      const list = [
        ...extractArgumentNamesList(func),
        ...extractVariableNamesList(func),
      ];

      const f = AST.parse(AST.generate(func));
      traverse(f, {
        Identifier(path) {
          const { node } = path;
          const cpr = comparer(node.name);
          if (cpr.in(list)) {
            node.name = _.camelCase(cpr.val);
          }
        },
      });

      return f.program.body[0] as FunctionNode;
    });
  }

  /**
   * 重新载入 this.ast
   */
  private reload(code: string | AST_TYPE) {
    this.ast = typeof code === "string" ? AST.parse(code) : code;
  }
}
