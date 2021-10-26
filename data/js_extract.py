# 从每个压缩包里抽取出js代码，并格式化

import os
import json
import zipfile


# 从压缩包中提取js文件
def extract_js_file():
    data_path = "../js代码"
    out_path = "./code dataset"
    data_list = os.listdir(data_path)

    error_zip_list = []

    for item in data_list:
        path_name = os.path.join(data_path, item)
        try:
            with zipfile.ZipFile(path_name, 'r') as z:
                # 获得压缩包里所有路径及文件名
                name_list = z.namelist()
                js_fname = []
                # 提取出js文件
                for fname in name_list:
                    # 取后缀名
                    if fname[-3:] == ".js":
                        js_fname.append(fname)

                # 创建导出的文件夹
                folder_name = os.path.join(out_path, item.split("-master")[0])
                if not os.path.exists(folder_name):
                    os.makedirs(folder_name)

                # 开始读取js文件
                for js_file in js_fname:
                    # 导出到文件夹
                    with open(os.path.join(folder_name, js_file.replace("/", "_")), "wb") as f:
                        js_content = z.read(js_file)
                        f.write(js_content)
        except Exception as e:
            error_zip_list.append(item)

    with open("error_zip_list.json", "w") as f:
        json.dump(error_zip_list, f)


if __name__ == '__main__':
    extract_js_file()
