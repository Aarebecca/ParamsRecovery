/** 从数据中创建训练所需的数据集 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import colors from "colors";
import UglifyJS from "uglify-js";
import { exit } from "process";
import { ts2js } from "./utils";
import { isNull, isUndefined } from "lodash";

export function uglify(code: string) {
  return UglifyJS.minify(code).code;
}

/**
 * 对前阶段遗留未处理的代码进行再次处理
 * 主要是：
 * 1. 给箭头函数补充命名，避免解析错误，如：
 *  * () => {}
 *  * p => {}
 * 2. 给匿名函数补充命名，如
 *  * function() {}
 *  * function (p) {}
 */
export function preprocess(_code: string) {
  let code = _code;
  // 对于 ArrayFunction 如果没有命名的话，会导致解析错误
  if (code[0] === "(") {
    code = `const f = ${code}`;
  }
  // 未命名的 FunctionDeclaration 需要指定名称
  code = code.replace(/(^[^\(][\S]+[^\)] =>)/g, function (match) {
    return `const f = ${match}`;
  });
  // 匿名函数指定名称
  code = code.replace(/function[ ]*\(/g, "function f(");
  return code;
}

export function createDataset() {
  const sourceDir = "../dataset/src";
  const targetDir = "../dataset/tar";
  const files = readdirSync(sourceDir);
  console.log(`任务量: ${files.length}`);

  for (const file of files) {
    console.log(`开始处理: ${file}`);

    const source = JSON.parse(
      readFileSync(`${sourceDir}/${file}`, "utf8")
    ) as string[];
    const raw: string[] = [];
    const minify: string[] = [];
    source.forEach((_code: string) => {
      const js = ts2js(preprocess(_code));
      if (!isNull(js)) {
        let code = js.code;
        /**
         * 排除：
         *  1. 超长的代码
         *  2. 短代码
         *  3. 单元测试代码
         */
        if (
          // 非空
          !isUndefined(code) &&
          !isNull(code) &&
          // 长度
          code.length < 1500 &&
          code.length > 50 &&
          // 不是单元测试代码
          !code.includes(" describe(") &&
          !code.includes(" it(") &&
          !code.includes(" expect(") &&
          !code.includes(".toBe(") &&
          !code.includes(".toEqual(")
        ) {
          const minifyCode = uglify(code);

          if (!isNull(minifyCode) || minifyCode !== "") {
            raw.push(code);
            minify.push();
          }
        }
      }
    });
    writeFileSync(
      path.join(targetDir, "raw", file),
      JSON.stringify(raw),
      "utf8"
    );
    writeFileSync(
      path.join(targetDir, "minify", file),
      JSON.stringify(minify),
      "utf8"
    );
    console.log(colors.green(`${file} done`));
  }

  console.log(colors.green("任务完成"));
  exit();
}
