import * as process from "process";
import colors from "colors";
import run from "./run";
import { createDataset } from "./uglify";
export * from "./ast";
export * from "./drop";
export * from "./extract";
export * from "./uglify";

const v8 = require("v8");
console.log(
  "可用堆大小: ",
  (v8.getHeapStatistics().total_available_size / 1024 / 1024 / 1024).toFixed(2),
  "GB"
);

const [f, ...args] = process.argv.slice(2);
if (f === "run") {
  console.log(colors.gray("执行代码提取转换"));
  // @ts-ignore
  run(...args);
} else if (f === "uglify") {
  console.log(colors.gray("执行代码压缩"));
  createDataset();
} else {
  console.log(colors.gray(`未选择正确的命令！, ${process.argv.slice(2)}`));
}
