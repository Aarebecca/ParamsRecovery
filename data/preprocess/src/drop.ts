/**
 * 判断给定方法是否可用
 */
import type { FunctionNode } from "types";
import { extractVariableNamesList, extractArgumentNamesList } from "./extract";

/**
 * 方法是否被压缩
 *
 * 主要是判断参数名、方法名长度是否为1
 *
 * ratio 和 minLen 表示，如果超过 ratio 比例的变量名、参数名的长度都大于 minLen，则认为是未压缩的
 */
export function isConfounding(
  f: FunctionNode,
  ratio = 0.8,
  minLen = 2
): boolean {
  const variableNamesList = extractVariableNamesList(f);
  const argumentNamesList = extractArgumentNamesList(f);
  const list = [...argumentNamesList, ...variableNamesList];

  return list.filter((v) => {
    return (v.slice(0, 3) === "..." ? v.slice(3) : v).length >= minLen;
  }).length >=
    list.length * ratio
    ? false
    : true;
}

/**
 * 方法中是否包含参数
 */
export function hasParameter(f: FunctionNode): boolean {
  return extractArgumentNamesList(f).length > 0;
}

/**
 * 方法中是否包含变量
 */
export function hasVariable(f: FunctionNode): boolean {
  return extractVariableNamesList(f).length > 0;
}

/**
 * 方法是否可用
 */
export function isFunctionAvailable(f: FunctionNode): boolean {
  return !isConfounding(f);
}
