import os
import json
import torch
import random
import argparse
import numpy as np
from transformers import RobertaTokenizer, RobertaConfig, RobertaModel, TrainingArguments, Trainer

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
tokenizer = RobertaTokenizer.from_pretrained('microsoft/codebert-base')
model = RobertaModel.from_pretrained('microsoft/codebert-base')
model.to(device)


def mask_tokens(inputs, mask_token_id, vocab_size, mlm_probability=0.15):
  """
  :param inputs:
  :param mask_token_id: mask token ([MASK]) 对应的 id
  :param vocab_size: 词汇表大小
  :param mlm_probability:
  :return:
  """
  # 将输入数据
  labels = inputs.clone()
  probability_matrix = torch.full(labels.shape, mlm_probability)
  # 基于伯努利分布来选择要遮住的位置
  masked_indices = torch.bernoulli(probability_matrix).bool()
  labels[~masked_indices]

  # 80% 概率使用 mask_token_id 替换掉
  indices_replaced = torch.bernoulli(torch.full(labels.shape, 0.8)).bool() & masked_indices
  inputs[indices_replaced] = mask_token_id

  # 10% (20%*50%) 概率 随机替换
  # 跳出要替换的位置
  indices_random = torch.bernoulli(torch.full(labels.shape, 0.5)).bool() & masked_indices & ~indices_replaced
  # 每个位置要替换的词
  random_words = torch.randint(vocab_size, labels.shape, dtype=torch.long)
  inputs[indices_random] = random_words[indices_random]
  return inputs, labels


def train(config):
  if not os.path.exists(args.save_dir): os.mkdir(args.save_dir)

  if args.gpu != '-1' and torch.cuda.is_available():
    device = torch.device('cuda')
    torch.cuda.set_rng_state(torch.cuda.get_rng_state())
    torch.backends.cudnn.deterministic = True
  else:
    device = torch.device('cpu')


if __name__ == '__main__':
  parser = argparse.ArgumentParser(description='Pretrain model config')
  parser.add_argument('--config', type=str, default="./config.json")

  config_path = parser.parse_args()["config"]
  args = json.load(open(config_path, 'r'))
  pretrain_config = args['pretrain_config']

  # set gpu
  os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
  os.environ["CUDA_VISIBLE_DEVICES"] = pretrain_config["gpu"]

  # set seed
  seed = pretrain_config["seed"]
  random.seed(seed)
  np.random.seed(seed)
  torch.manual_seed(seed)
