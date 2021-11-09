import { uglify, preprocess } from "../../src";

describe("uglify", () => {
  it("preprocess", () => {
    const code = [
      "event => {\n if (onScroll) {\n onScroll(event);\n }\n\n this.state.scrollY.setValue(event.nativeEvent.contentOffset.y);\n}",
      "() => {\n const {\n closeOnTouchOutside\n } = this.props;\n if (closeOnTouchOutside) this._springHide();\n}",
      "function () {}",
      "function(){}",
      "function(p){return p}",
    ];
    expect(preprocess(code[0])).toBe(`const f = ${code[0]}`);
    expect(preprocess(code[1])).toBe(`const f = ${code[1]}`);
    expect(preprocess(code[2])).toBe(`function f() {}`);
    expect(preprocess(code[3])).toBe(`function f(){}`);
    expect(preprocess(code[4])).toBe(`function f(p){return p}`);
  });

  it("default", () => {
    const code1 = "function add(first, second) { return first + second; }";
    const code2 = "console.log(add(1 + 2, 3 + 4));";

    expect(uglify(code1)).toBe("function add(n,d){return n+d}");
    expect(uglify(code2)).toBe("console.log(add(3,7));");
  });
});
