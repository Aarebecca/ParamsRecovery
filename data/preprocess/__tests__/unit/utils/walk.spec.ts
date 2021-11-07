import { walk } from "../../../src/utils";

describe("walk", () => {
  it("default", (done) => {
    let flag = true;
    walk("./__tests__/unit/utils/tests_folder", (path) => {
      flag =
        flag &&
        [
          "__tests__\\unit\\utils\\tests_folder\\a.txt",
          "__tests__\\unit\\utils\\tests_folder\\b\\a.txt",
          "__tests__\\unit\\utils\\tests_folder\\b\\c.txt",
        ].includes(path);
    }).then(() => {
      expect(flag).toBe(true);
      done();
    });
  });

  it("async", (done) => {
    walk("./__tests__/unit/utils/tests_folder", (path) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    }).then(() => {
      done();
    });
  });
});
