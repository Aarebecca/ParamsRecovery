import torch
from torch import nn


class PRModel(nn.Module):
  def __init__(self):
    super(PRModel, self).__init__()

  def forward(self):
      ...

  def predict(self):
      ...

  def beam_search(self):
      ...