# model

> 基于 [lxnet ](https://huggingface.co/transformers/model_doc/xlnet.html) 和 [DIRECT](https://github.com/DIRECT-team/DIRECT-nlp4prog)

### 主要改进

* 基于 lxnet 能够更好处理长文本代码
* 在 transformer 的 encoder 和 decoder 上额外添加一层 normalization 层，使得 FP16 精度下的训练更稳定
* 将ast信息嵌入到源代码中
  1. 标记变量和非变量
  2. 标记每个 token 的类型

### 数据准备
#### 词汇表
输入的单词映射
输出的单词映射


### 评估度量
* BLUE
* CodeBLUE
