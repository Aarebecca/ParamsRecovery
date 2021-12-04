import {
  AST,
  isConfounding,
  hasParameter,
  hasVariable,
  isFunctionAvailable,
} from "../../src";

describe("drop", () => {
  it("isConfounding", () => {
    expect(
      isConfounding(
        new AST(`function a(b, [c, ...rest0], {d, ...rest1}, ...rest2){ }`)
          .functions[0]
      )
    ).toBe(true);
    expect(
      isConfounding(
        new AST(
          `function a(boy, [creat, ...rest0], {day, ...rest1}, ...rest2){ }`
        ).functions[0]
      )
    ).toBe(false);
  });

  it("hasParameter", () => {
    expect(
      hasParameter(
        new AST(
          `function a(boy, [creat, ...rest0], {day, ...rest1}, ...rest2){ }`
        ).functions[0]
      )
    ).toBe(true);
    expect(hasParameter(new AST(`function a(){ }`).functions[0])).toBe(false);
  });

  it("hasVariable", () => {
    expect(
      hasVariable(new AST(`function a(){ let a = 1; }`).functions[0])
    ).toBe(true);
    expect(hasVariable(new AST(`function a(){ }`).functions[0])).toBe(false);
  });

  it("isFunctionAvailable", () => {
    expect(
      isFunctionAvailable(new AST(`function a(){ let a = 1; }`).functions[0])
    ).toBe(false);
    expect(
      isFunctionAvailable(
        new AST(`function a(){ let aaron = 1; }`).functions[0]
      )
    ).toBe(true);
    expect(
      isFunctionAvailable(new AST(`function a(p){ let a = 1; }`).functions[0])
    ).toBe(false);
    expect(
      isFunctionAvailable(
        new AST(`function a(parent){ let aaron = 1; }`).functions[0]
      )
    ).toBe(true);
  });
});
