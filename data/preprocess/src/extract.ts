import traverse from '@babel/traverse';
import { isArray, isNull, isObject, isString, keys, set } from '@antv/util';
/**
 * 从函数中提取参数
 */
import type { FunctionNode, AnyObject } from "./types";
import type {
  BlockStatement,
  VariableDeclaration,
  Identifier,
  ArrayPattern,
  ObjectPattern,
  LVal,
  AssignmentPattern,
} from "@babel/types";
/**
 * 从 ast 函数中提取出变量声明
 */
export function extractVariables(f: FunctionNode): VariableDeclaration[] {
  const variables: VariableDeclaration[] = [];
  // const ast = AST.parse(AST.generate(f));
  traverse(f, {
    noScope: true,
    VariableDeclaration({ node }) {
      variables.push(node);
    },
  });
  return variables;
}

/**
 * 提取出变量名并保持解构的格式
 */
export function extractVariableNames(f: FunctionNode): any[] {
  const variables = extractVariables(f);
  return variables.map(({ declarations }) => {
    return declarations.map(({ id }) => {
      return extractIdentifierRestElementPattern(id);
    });
  });
}

/**
 * 提取出变量名以数组的形式返回
 */
export function extractVariableNamesList(f: FunctionNode): string[] {
  const variableNames = extractVariableNames(f);
  const list: string[] = [];

  function parse(n: Array<any> | AnyObject<string | Object>) {
    if (isArray(n)) {
      n.forEach((item) => {
        parse(item);
      });
    } else if (isObject(n)) {
      keys(n).forEach((key: string) => {
        const val = n[key];
        if (isString(val)) {
          val === "Identifier" && list.push(key);
          val === "RestElement" && list.push(`...${key}`);
        } else {
          parse(val as AnyObject<Object>);
        }
      });
    } else if (isString(n)) {
      list.push(n);
    }
  }

  variableNames.forEach((names) => {
    names.forEach((name: any) => {
      parse(name);
    });
  });
  return list;
}

/**
 * 从 ast 函数中提取出参数名
 */
export function extractArgumentNames(f: FunctionNode): any[] {
  const { params } = f;
  return params.map(extractIdentifierRestElementPattern);
}

/**
 * 提取出参数名以数组的形式返回
 */
export function extractArgumentNamesList(f: FunctionNode): string[] {
  const argumentNames = extractArgumentNames(f);
  const list: string[] = [];

  function parse(n: Array<any> | AnyObject<string | Object>) {
    if (isArray(n)) {
      n.forEach((item) => {
        parse(item);
      });
    } else if (isObject(n)) {
      keys(n).forEach((key: string) => {
        const val = n[key];
        if (isString(val)) {
          val === "Identifier" && list.push(key);
          val === "AssignmentPattern" &&
            list.push(
              ((val as unknown as AssignmentPattern).left as Identifier).name
            );
          val === "RestElement" && list.push(`...${key}`);
        } else {
          parse(val as AnyObject<Object>);
        }
      });
    } else if (isString(n)) {
      list.push(n);
    }
  }

  argumentNames.forEach((n) => {
    parse(n);
  });
  return list;
}

/**
 * 解析 Identifier | RestElement | Pattern 结构
 */
export function extractIdentifierRestElementPattern(pattern: LVal): any {
  function objDFS(p: ObjectPattern, path: any[]) {
    p.properties.forEach((node) => {
      const { type } = node;
      if (type === "RestElement") {
        // leaf node
        set(
          result,
          [...path, (node.argument as Identifier).name],
          "RestElement"
        );
      } else if (node.value.type === "Identifier") {
        // leaf node
        set(result, [...path, node.value.name], "Identifier");
      } else if (node.value.type === "ObjectPattern") {
        // non-leaf node
        const child = node.value;
        objDFS(child, [...path, (node.key as Identifier).name]);
      } else if (node.value.type === "ArrayPattern") {
        // non-leaf node
        const child = node.value;
        const newPath = [...path, (node.key as Identifier).name];
        set(result, newPath, []);
        arrDFS(child, newPath);
      } else if (node.value.type === "AssignmentPattern") {
        set(
          result,
          [...path, (node.value.left as Identifier).name],
          "Assignment"
        );
      }
    });
  }

  function arrDFS(p: ArrayPattern, path: any[]) {
    p.elements.forEach((node, index) => {
      if (isNull(node)) {
        // 不设置值即置为空
        // set(result, [...path, index], "null");
      } else if (node.type === "Identifier") {
        set(result, [...path, index], node.name);
      } else if (node.type === "ArrayPattern") {
        const newPath = [...path, index];
        set(result, newPath, []);
        arrDFS(node, newPath);
      } else if (node.type === "ObjectPattern") {
        const newPath = [...path, index];
        set(result, newPath, {});
        objDFS(node, newPath);
      } else if (node.type === "RestElement") {
        set(
          result,
          [...path, index],
          `...${(node.argument as Identifier).name}`
        );
      } else {
        node;
        set(result, [...path, index], (node.left as Identifier).name);
      }
    });
  }

  let result: any;
  if (pattern.type === "ArrayPattern") {
    result = [];
    arrDFS(pattern, []);
  } else if (pattern.type === "ObjectPattern") {
    result = {};
    objDFS(pattern, []);
  } else if (pattern.type === "Identifier") {
    return pattern.name;
  } else if (pattern.type === "RestElement") {
    return `...${(pattern.argument as Identifier).name}`;
  } else if (pattern.type === "AssignmentPattern") {
    return (pattern.left as Identifier).name;
  }
  // else {
  //   return pattern;
  // }

  return result;
}

/**
 * 匹配两个 函数 中的参数
 * 基于 ？ 进行判断
 * 1. ast 中的路径相似度
 * 2. 变量的行为
 */
// export function matchParams(
//   f1: FunctionNode,
//   f2: FunctionNode
// ): boolean {

// }
