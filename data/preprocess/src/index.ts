export * from "./ast";
export * from "./drop";
export * from "./extract";
export * from "./uglify";

import run from "./run";
import * as process from "process";

const v8 = require("v8");
console.log(
  "可用堆大小: ",
  (v8.getHeapStatistics().total_available_size / 1024 / 1024 / 1024).toFixed(2),
  " GB"
);

run(...process.argv.slice(2));
