import { AST } from "./ast";
import { walk } from "./utils/walk";
import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

export default function (output = "../dataset/dataset") {
  // look through all the files in the extract folder
  // const dataset = [];
  // walk("../extract", (path, stat) => {
  //   // read file from path
  //   const file = readFileSync(path, "utf8");
  //   // parse file as ast
  //   const ast = new AST(file);
  //   const { availableFunctions } = ast;

  //   dataset.push(...ast.functions);
  // });
}
