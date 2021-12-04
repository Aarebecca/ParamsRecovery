/**
 * 处理流程控制
 * 1. 生成抽象语法树 AST
 *  1.1 提取方法
 *    1.1.1 箭头函数 ArrowFunctionExpression
 *    1.1.2 函数表达式 FunctionExpression
 *    1.1.3 函数声明 FunctionDeclaration
 *    1.1.4 NewExpression
 * 2. 排除压缩方法 drop
 * 3. 代码规范化 generator
 * 4. 变量抽取 extract
 * 
 */
