import colors from "colors";
import path from "path";
import { AST } from "./ast";
import { exit } from "process";
import { parentPort, workerData } from "worker_threads";
import { readFileSync, writeFileSync } from "fs";
import { walk } from "./utils/walk";

const { id, input, output } = workerData;
const dataset: string[] = [];
console.log(colors.blue(`进程启动: ${id}`));

Promise.all(
  input.map((folder: string) => {
    return walk(folder, (path) => {
      // read file from path
      const file = readFileSync(path, "utf8");
      // parse file as ast
      try {
        const ast = new AST(file);
        const { availableFunctions } = ast;
        dataset.push(...availableFunctions.map(AST.generate));
      } catch (e) {
        // console.log("Error Parsing: ", path);
      }
    });
  })
).then(() => {
  try {
    writeFileSync(output, JSON.stringify(dataset));
    parentPort?.postMessage({
      id,
      status: "success",
    });
  } catch (e) {
    console.log(
      colors.red(`Error Writing: ${id}\n`),
      colors.gray(`输出路径: ${output}\n`),
      colors.gray(`目标来源: ${input}\n`),
      colors.gray(`错误信息: ${e}`)
    );
    parentPort?.postMessage({
      id,
      status: "error",
    });
  }
  console.log(colors.gray(`进程退出: ${id}`));
  exit();
});
