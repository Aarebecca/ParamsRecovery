/** 从数据中创建训练所需的数据集 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import colors from "colors";
import UglifyJS from "uglify-js";
import { exit } from "process";

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
    source.forEach((code: string) => {
      if (code.length < 1500 && code.length > 50) {
        raw.push(code);
        minify.push(uglify(code));
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
