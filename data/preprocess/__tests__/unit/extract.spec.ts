import { parse } from "@babel/parser";
import {
  extractPattern,
  extractVariables,
  extractVariableNames,
  extractArgumentNames,
} from "../../src/extract";
import { AST } from "../../src/ast";

describe("Extract", () => {
  it("Identifier", () => {
    const ast = parse(`function a(){ let i = 10 }`);
    // @ts-ignore
    const pattern = ast.program.body[0].body.body[0].declarations[0].id;
    expect(extractPattern(pattern)).toEqual("i");
  });

  it("extractObjectPattern", () => {
    const ast = parse(
      `function a(z){let {a, b: {c}, d:{e:{F: [g, h, i]}},...rest} = obj;}`
    );
    // @ts-ignore
    const pattern = ast.program.body[0].body.body[0].declarations[0].id;
    expect(extractPattern(pattern)).toStrictEqual({
      a: "Identifier",
      b: { c: "Identifier" },
      d: { e: { F: ["g", "h", "i"] } },
      rest: "RestElement",
    });
  });

  it("extractArrayPattern", () => {
    const ast = parse(`
    function a(z){ let [, b=1, [c], {d: [f, {h}]},...rest] = obj;}
    `);
    // @ts-ignore
    const pattern = ast.program.body[0].body.body[0].declarations[0].id;
    expect(extractPattern(pattern)).toStrictEqual([
      ,
      "b",
      ["c"],
      { d: ["f", { h: "Identifier" }] },
      "...rest", // 在 ArrayPattern 中，RestElement 需要在名字前标识 ...
    ]);
  });

  it("extractVariables", () => {
    const { functions } = new AST(`
    function a(z){ 
      let [, b=1,...rest] = obj;
      let i = 2;
      let {j, k: {l}} = obj;
    }
    `);
    expect(extractVariables(functions[0]).length).toBe(3);
    const names = extractVariableNames(functions[0]);
    expect(names.length).toBe(3);
    const [v0, v1, v2] = names;

    expect(v0).toStrictEqual([[, "b", "...rest"]]);
    expect(v1).toStrictEqual(["i"]);
    expect(v2).toStrictEqual([{ j: "Identifier", k: { l: "Identifier" } }]);
  });

  it("availableFunctions", () => {
    const { availableFunctions } = new AST(`
    function a(z){ 
      let [, b=1,...rest] = obj;
      let i = 2;
      let {j, k: {l}} = obj;
    }
    `);
    console.log(availableFunctions);
  });
});
