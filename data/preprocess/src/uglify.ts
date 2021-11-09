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
    source.forEach((rawCode: string) => {
      let codeState1 = rawCode;
      // 对于 ArrayFunction 如果没有命名的话，会导致解析错误
      if (codeState1[0] === "(") {
        codeState1 = `const f = ${codeState1}`;
      }
      // 未命名的 FunctionDeclaration 需要指定名称


      const ts = ts2js(codeState1);
      if (!isNull(ts)) {
        let codeState2 = ts.code;
        /**
         * 排除：
         *  1. 超长的代码
         *  2. 短代码
         *  3. 单元测试代码
         */
        if (
          // 非空
          !isUndefined(codeState2) &&
          !isNull(codeState2) &&
          // 长度
          codeState2.length < 1500 &&
          codeState2.length > 50 &&
          // 不是单元测试代码
          !codeState2.includes(" describe(") &&
          !codeState2.includes(" it(") &&
          !codeState2.includes(" expect(") &&
          !codeState2.includes(".toBe(") &&
          !codeState2.includes(".toEqual(")
        ) {
          const minifyCode = uglify(codeState2);

          if (!isNull(minifyCode) || minifyCode !== "") {
            raw.push(codeState2);
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
