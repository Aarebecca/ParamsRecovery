import { parse } from "@babel/parser";
import {
  extractIdentifierRestElementPattern,
  extractVariables,
  extractVariableNames,
  extractVariableNamesList,
  extractArgumentNames,
  extractArgumentNamesList,
} from "../../src/extract";
import { AST } from "../../src/ast";

describe("Extract", () => {
  it("Identifier", () => {
    const ast = parse(`function a(){ let i = 10 }`);
    // @ts-ignore
    const pattern = ast.program.body[0].body.body[0].declarations[0].id;
    expect(extractIdentifierRestElementPattern(pattern)).toEqual("i");
  });

  it("extractObjectPattern", () => {
    const ast = parse(
      `function a(z){let {a, b: {c}, d:{e:{F: [g, h, i]}},...rest} = obj;}`
    );
    // @ts-ignore
    const pattern = ast.program.body[0].body.body[0].declarations[0].id;
    expect(extractIdentifierRestElementPattern(pattern)).toStrictEqual({
      a: "Identifier",
      b: { c: "Identifier" },
      d: { e: { F: ["g", "h", "i"] } },
      rest: "RestElement",
    });
  });

  it("extractArrayPattern", () => {
    const ast = parse(`
    function a(z){ let [, b0, b=1, [c], {d: [f, {h}]},...rest] = obj;}
    `);
    // @ts-ignore
    const pattern = ast.program.body[0].body.body[0].declarations[0].id;
    expect(extractIdentifierRestElementPattern(pattern)).toStrictEqual([
      ,
      "b0",
      "b",
      ["c"],
      { d: ["f", { h: "Identifier" }] },
      "...rest", // 在 ArrayPattern 中，RestElement 需要在名字前标识 ...
    ]);
  });

  it("extractVariables", () => {
    let { functions } = new AST(`
    function a(z){ 
      let [, b=1,...rest] = obj;
      let i = 2;
      let {j, k: {l}} = obj;
    }
    `);
    expect(extractVariables(functions[0]).length).toBe(3);
    let names = extractVariableNames(functions[0]);
    expect(names.length).toBe(3);
    let [v0, v1, v2] = names;

    expect(v0).toStrictEqual([[, "b", "...rest"]]);
    expect(v1).toStrictEqual(["i"]);
    expect(v2).toStrictEqual([{ j: "Identifier", k: { l: "Identifier" } }]);

    functions = new AST(`
    const a = (z) => { 
      let [, b=1,...rest] = obj;
      let i = 2;
      let {j, k: {l}} = obj;
    }
    `).functions;

    expect(extractVariables(functions[0]).length).toBe(3);
    names = extractVariableNames(functions[0]);
    expect(names.length).toBe(3);
    [v0, v1, v2] = names;

    expect(v0).toStrictEqual([[, "b", "...rest"]]);
    expect(v1).toStrictEqual(["i"]);
    expect(v2).toStrictEqual([{ j: "Identifier", k: { l: "Identifier" } }]);

    functions = new AST(`
      a = new Function('{let [, b=1,...rest] = obj;let i = 2;let {j, k: {l}} = obj;}')
    `).functions;

    expect(extractVariables(functions[0]).length).toBe(3);
    names = extractVariableNames(functions[0]);
    expect(names.length).toBe(3);
    [v0, v1, v2] = names;

    expect(v0).toStrictEqual([[, "b", "...rest"]]);
    expect(v1).toStrictEqual(["i"]);
    expect(v2).toStrictEqual([{ j: "Identifier", k: { l: "Identifier" } }]);
  });

  it("extractVariableNamesList", () => {
    const { functions } = new AST(`
    function a(z){ 
      let [, b=1,...rest1] = obj;
      let i = 2;
      let {j, k: {l, ...rest2}} = obj;
    }
    `);
    const variableNamesList = extractVariableNamesList(functions[0]);
    expect(variableNamesList).toStrictEqual([
      "b",
      "...rest1",
      "i",
      "j",
      "l",
      "...rest2",
    ]);
  });

  it("extractArgumentNames", () => {
    const { functions } = new AST(
      `function a(b, b1=1, [, c, ...rest0], {d, ...rest1}, ...rest2){ }`
    );
    const argumentNames = extractArgumentNames(functions[0]);
    expect(argumentNames.length).toStrictEqual(5);
    expect(argumentNames[0]).toStrictEqual("b");
    expect(argumentNames[1]).toStrictEqual("b1");
    expect(argumentNames[2]).toStrictEqual([, "c", "...rest0"]);
    expect(argumentNames[3]).toStrictEqual({
      d: "Identifier",
      rest1: "RestElement",
    });
    expect(argumentNames[4]).toStrictEqual("...rest2");
  });

  it("extractArgumentNamesList", () => {
    const { functions } = new AST(
      `function a(b , b1 = 1, [, c, ...rest0], {d, ...rest1}, ...rest2){ }`
    );
    const argumentNamesList = extractArgumentNamesList(functions[0]);
    expect(argumentNamesList).toStrictEqual([
      "b",
      "b1",
      "c",
      "...rest0",
      "d",
      "...rest1",
      "...rest2",
    ]);
  });
});
