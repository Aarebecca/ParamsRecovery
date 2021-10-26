import os
import json
import random
import requests
from contextlib import closing
from multiprocessing import Pool

error_list = []
exists_list = []


def d(url, branch, filepath):
    headers_list = [
        'Mozilla/5.0 (Windows; U; MSIE 9.0; Windows NT 9.0; en-US)',
        'Mozilla/5.0 (compatible; MSIE 10.0; Macintosh; Intel Mac OS X 10_7_3; Trident/6.0)',
        'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)',
        'Opera/9.80 (X11; Linux i686; U; ru) Presto/2.8.131 Version/11.11',
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Chrome/22.0.1216.0 Safari/537.2',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/537.13 (KHTML, like Gecko) Chrome/24.0.1290.1 Safari/537.13',
        'Mozilla/5.0 (X11; CrOS i686 2268.111.0) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11',
        'Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:16.0.1) Gecko/20121011 Firefox/16.0.1',
        'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:15.0) Gecko/20100101 Firefox/15.0.1',
        'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
    ]

    headers = {'User-Agent': random.choice(headers_list)}
    f_path, f_name = os.path.split(filepath)
    print(f"{f_name}-{branch} start...")

    # download file from url
    with closing(requests.get(f"{url}{branch}.zip", stream=True, headers=headers)) as r:
        r.raise_for_status()
        with open(filepath, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
            print(f"{f_name}-{branch} done!")


def download(url, filepath):
    try:
        d(url, "main", filepath)
    except Exception as e:
        try:
            d(url, "master", filepath)
        except:
            error_list.append([url, filepath])


def read_source_list(path):
    res = []
    with open(path, "r") as f:
        item = f.readline()
        while item:
            res.append(item.replace("\n", ""))
            item = f.readline()
    return res


if __name__ == "__main__":
    source_list = read_source_list("data_source.txt")

    save_path = "./source_zip"
    pool = Pool(20)
    for item in source_list:
        url = "https://github.com/" + item + "/archive/refs/heads/"
        file_path = os.path.join(save_path, item.split("/")[-1]+".zip")
        if not os.path.exists(file_path):
            pool.apply_async(download, args=(url, file_path,))
        else:
            exists_list.append(item)
    pool.close()
    pool.join()

    with open("error_list.txt", "w") as f:
        json.dump(error_list, f)

    with open("exists_list.txt", "w") as f:
        json.dump(exists_list, f)
