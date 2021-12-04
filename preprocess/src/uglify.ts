/** 从数据中创建训练所需的数据集 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import colors from "colors";
import UglifyJS from "uglify-js";
import { exit } from "process";
import { ts2js } from "./utils";
import cliProgress from "cli-progress";
import { extractArgumentNamesList, extractVariableNamesList } from "./extract";
import { isNull, isUndefined } from "lodash";
import { AST } from "./ast";

import type { AnyObject } from "./types";
export function uglify(code: string, options = {}) {
  return UglifyJS.minify(code, options).code;
}

type NameMap = {
  params: AnyObject<string>;
  variables: AnyObject<string>;
};

/**
 * 对前阶段遗留未处理的代码进行再次处理
 * 主要是：
 * 1. 给箭头函数补充命名，避免解析错误，如：
 *  * () => {}
 *  * p => {}
 *  * async () => {}
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
  code = code.replace(/^function[ ]*\(/g, "function f(");
  // 异步函数指定名称
  code = code.replace(/async[ ]*\(/g, "async function f(");

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

    const codes: {
      raw: string;
      minify: string;
      nameMap: NameMap;
    }[] = [];

    const bar = new cliProgress.SingleBar({
      format: `${files.indexOf(file)} / ${
        files.length
      } [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`,
    });
    bar.start(source.length, 0);

    source.forEach((_code: string, index: number) => {
      try {
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
            // 去除注释的源代码
            const sourceCode = AST.generate(AST.parse(code), {
              comments: false,
              compact: true,
            });
            // 正常压缩混淆代码
            const minifyCode = uglify(sourceCode);
            // 保留变量名的压缩代码
            const withNameCode = uglify(sourceCode, {
              mangle: false,
            });

            if (!isNull(minifyCode) || minifyCode !== "") {
              const {
                functions: [functionNodeWithName],
              } = new AST(withNameCode);
              const {
                functions: [functionNodeWithMinifyName],
              } = new AST(minifyCode);

              const argumentNames =
                extractArgumentNamesList(functionNodeWithName);
              const variableNames =
                extractVariableNamesList(functionNodeWithName);
              const argumentMinifyNames = extractArgumentNamesList(
                functionNodeWithMinifyName
              );
              const variableMinifyNames = extractVariableNamesList(
                functionNodeWithMinifyName
              );
              const nameMap = {
                params: {} as AnyObject<string>,
                variables: {} as AnyObject<string>,
              };
              argumentNames.forEach((name, index) => {
                nameMap.params[argumentMinifyNames[index]] = name;
              });
              variableNames.forEach((name, index) => {
                nameMap.variables[variableMinifyNames[index]] = name;
              });
              codes.push({
                nameMap,
                raw: sourceCode,
                minify: minifyCode,
              });
            }
          }
        }
        bar.increment();
      } catch (e) {}
    });
    writeFileSync(path.join(targetDir, file), JSON.stringify(codes), "utf8");
  }

  console.log(colors.green("任务完成"));
  exit();
}
