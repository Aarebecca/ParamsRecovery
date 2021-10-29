/** 从数据中创建训练所需的数据集 */
const fs = require("fs");
const UglifyJS = require("uglify-js");

export function uglify(code: string) {
  return UglifyJS.minify(code).code;
}

function createDataset() {}
