import { transformSync } from "@babel/core";
import { ts2js } from "../../src/utils";

describe("ts2js", () => {
  const codes = [
    `const a = 1;`,
    `const a: number = 1;`,
    `const a = 1 as number;`,
    `function a(p, q) {}`,
    // `function (p, q) {}`,
    `function a(p: number, q: string): string[] {}`,
    `function a(p: number, q: string): string[] { return []; }`,
    `(p, q) => {}`,
    `p => {}`,
    `const a = (p, q) => {}`,
    `const a = (p: number, q: string): string[] => {}`,
  ];

  it("ts2js", () => {
    codes.forEach((code) => {
      // @ts-ignore
      console.log(ts2js(code).code);
    });
  });
});
