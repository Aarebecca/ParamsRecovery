import { comparer } from "../../../src/utils";

describe("comparer", () => {
  it("default", () => {
    const c1 = comparer("abc");
    expect(c1.raw).toBe("abc");
    expect(c1.val).toBe("abc");
    expect(c1.cmp("abc")).toBe(true);
    expect(c1.cmp("abcd")).toBe(false);
    expect(c1.in(["a", "ab", "abc"])).toBe(true);
    expect(c1.in(["a", "ab", "abcd"])).toBe(false);
  });
});
