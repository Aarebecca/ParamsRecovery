import { AST } from "./ast";
import { exit } from "process";
import { parentPort, workerData } from "worker_threads";
import { readFileSync } from "fs";
import { walk } from "./utils/walk";

const { id, input } = workerData;
const dataset: string[] = [];
console.log(`进程启动: ${id}`);

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
  console.log(`进程结束: ${id}`);

  parentPort?.postMessage(dataset);
  exit();
});
