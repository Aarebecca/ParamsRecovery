import { walk } from "../../../src/utils";

describe("walk", () => {
  it("default", (done) => {
    walk("./__tests__/unit/utils/tests_folder", async (path, stat) => {
      expect(path).toBe("./__tests__/unit/utils/tests_folder/a.txt");
      done();
    });
  });
});
