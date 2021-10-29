import * as fs from "fs";

/**
 * 递归遍历文件夹里的文件
 * Traverse the folder
 */
export function walk(
  dir: string,
  callback: (path: string, stat: fs.Stats) => void | Promise<any>
) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach((file) => {
      const path = dir + "/" + file;
      fs.stat(path, (err, stat) => {
        if (err) {
          throw err;
        }

        if (stat.isDirectory()) {
          walk(path, callback);
        } else {
          callback(path, stat);
        }
      });
    });
  });
}
