/**
 * 处理流程控制
 * 1. 移除已压缩混淆的文件
 * 2. 生成抽象语法树
 *  2.1 提取方法
 *    2.1.1 箭头函数 ArrowFunctionExpression
 *    2.1.2 函数表达式 FunctionExpression
 *    2.1.3 函数声明 FunctionDeclaration
 *    2.1.4 NewExpression
 * 3. 排除压缩方法
 * 4. 代码规范化
 * 5. 变量抽取
 * 
 */
