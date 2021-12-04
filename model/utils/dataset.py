import sys
import time
import json
import torch
import random
import gzip
import numpy as np


def get_json_iterator_from_tar_file(file_paths, shuffle=False, seed=42):
  """读取 tar 压缩包中的 jsonl 文件，并置入迭代器"""
  random.seed(seed)
  np.random.seed(seed)
  torch.manual_seed(seed)

  for file_path in file_paths:
    payloads = []
    t1 = time.time()
    with gzip.open(file_path, 'r') as f:
      payloads.append(json.loads(f.readline().decode()))

    if shuffle:
      np.random.shuffle(payloads)

    print(f'load shard {file_path} took {time.time() - t1:.4f}s, length={len(payloads)}', file=sys.stderr)

    for payload in payloads:
      yield payload