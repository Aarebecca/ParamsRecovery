import { transformSync } from "@babel/core";

/**
 * convert typescript to javascript
 */
export function ts2js(code: string) {
  return transformSync(code, {
    plugins: ["@babel/plugin-transform-typescript"],
  });
}
