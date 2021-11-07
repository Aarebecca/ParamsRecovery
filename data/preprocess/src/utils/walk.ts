import * as fs from "fs";
const path = require("path");

/**
 * 递归遍历文件夹里的文件
 * Traverse the folder
 */
export function walk(
  dir: string,
  callback: (file: string) => void | Promise<void>
) {
  return new Promise<void>((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        return reject(error);
      }
      Promise.all(
        files.map((file) => {
          return new Promise<void>((resolve, reject) => {
            const filepath = path.join(dir, file);
            fs.stat(filepath, (error, stats) => {
              if (error) {
                return reject(error);
              }
              if (stats.isDirectory()) {
                walk(filepath, callback).then(resolve);
              } else if (stats.isFile()) {
                const result = callback(filepath);
                if (!result) {
                  resolve();
                } else {
                  result.then(resolve);
                }
              }
            });
          });
        })
      ).then(() => {
        resolve();
      });
    });
  });
}
