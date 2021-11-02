import type {
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
} from "@babel/types";

export type FunctionNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression;

export type AnyObject = { [key: string]: any };
