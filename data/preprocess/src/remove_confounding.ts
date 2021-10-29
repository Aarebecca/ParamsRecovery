/**
 * 移除已经压缩混淆的文件
 */
import * as fs from "fs";
import { ast } from "./ast";
import { walk } from "./utils/walk";

export function removeConfounding(folder: string, output: string, flag: string = "w"): void {
  walk(folder, (file) => {
    /**
     * 读入文件并创建ast
     */
    fs.readFile(file, "utf-8", (err, data) => {
      console.log(file);
      const tree = ast(data);
    });
  });
}


