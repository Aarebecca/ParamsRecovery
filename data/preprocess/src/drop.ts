/**
 * 判断给定方法是否可用
 */
import type { FunctionNode } from "types";
import { flatten } from "@antv/util";
import { extractVariableNames } from "./extract";

/**
 * 方法是否被压缩
 */
function isConfounding(f: FunctionNode): boolean {
  /**
   * 主要是判断参数名、方法名长度是否为1
   */
  const variableNames = extractVariableNames(f);
  console.log(variableNames);

  return true;
}

/**
 * 方法中是否包含参数
 */
function hasParameter(f: FunctionNode): boolean {
  return true;
}

/**
 * 方法中是否包含变量
 */
function hasVariable(f: FunctionNode): boolean {
  return true;
}

/**
 * 方法是否可用
 */
export function isFunctionAvailable(f: FunctionNode): boolean {
  return isConfounding(f) && (hasParameter(f) || hasVariable(f));
}
