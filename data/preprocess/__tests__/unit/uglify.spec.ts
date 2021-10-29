import { uglify } from "../../src";

describe("uglify", () => {
  it("default", () => {
    const code1 = "function add(first, second) { return first + second; }";
    const code2 = "console.log(add(1 + 2, 3 + 4));";

    expect(uglify(code1)).toBe("function add(n,d){return n+d}");
    expect(uglify(code2)).toBe("console.log(add(3,7));");
  });
});
