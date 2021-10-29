import { ast } from "../../src";

describe("ast", () => {
  it("ArrowFunctionExpression", () => {
    const code1 = "() => {return 0}";
    const code2 = "let f = () => {}";
    const tree1 = ast(code1);
    const tree2 = ast(code2);
  });

  it("FunctionDeclaration", () => {
    const code1 = "function add(first, second) { return first + second; }";
    const code2 = "function (first, second) { return first + second; }";
    const _tree1 = {
      body: [
        {
          async: false,
          body: {
            body: [
              {
                argument: {
                  left: { name: "first", type: "Identifier" },
                  operator: "+",
                  right: { name: "second", type: "Identifier" },
                  type: "BinaryExpression",
                },
                type: "ReturnStatement",
              },
            ],
            type: "BlockStatement",
          },
          expression: false,
          generator: false,
          id: { name: "add", type: "Identifier" },
          params: [
            { name: "first", type: "Identifier" },
            { name: "second", type: "Identifier" },
          ],
          type: "FunctionDeclaration",
        },
      ],
      sourceType: "script",
      type: "Program",
    };

    const tree1 = ast(code1);
    expect(tree1.type).toStrictEqual("Program");
    expect(tree1.sourceType).toBe("script");
    expect(tree1.body[0].type).toBe("FunctionDeclaration");
    expect(tree1.body[0].id.name).toBe("add");
    expect(tree1.body[0].params[0].name).toBe("first");
    expect(tree1.body[0].params[1].name).toBe("second");
    expect(tree1.body[0].body.body[0].type).toBe("ReturnStatement");
    expect(tree1.body[0].body.body[0].argument.type).toBe("BinaryExpression");
    expect(tree1.body[0].body.body[0].argument.left.name).toBe("first");
    expect(tree1.body[0].body.body[0].argument.right.name).toBe("second");
    expect(tree1.body[0].body.body[0].argument.operator).toBe("+");
  });

  it("FunctionExpression", () => {
    /**
     * 匿名方法表达式的 id 为 null
     */
    const code1 = "const f = function a(){return 0}";
    const code2 = "const f = function () {return 0}";
    const tree1 = ast(code1);
    const tree2 = ast(code2);

    const _tree1 = {
      body: [
        {
          declarations: [
            {
              id: { name: "f", type: "Identifier" },
              init: {
                async: false,
                body: {
                  body: [
                    {
                      argument: { raw: "0", type: "Literal", value: 0 },
                      type: "ReturnStatement",
                    },
                  ],
                  type: "BlockStatement",
                },
                expression: false,
                generator: false,
                id: { name: "a", type: "Identifier" },
                params: [],
                type: "FunctionExpression",
              },
              type: "VariableDeclarator",
            },
          ],
          kind: "const",
          type: "VariableDeclaration",
        },
      ],
      sourceType: "script",
      type: "Program",
    };
    const _tree2 = {
      body: [
        {
          declarations: [
            {
              id: { name: "f", type: "Identifier" },
              init: {
                async: false,
                body: {
                  body: [
                    {
                      argument: { raw: "0", type: "Literal", value: 0 },
                      type: "ReturnStatement",
                    },
                  ],
                  type: "BlockStatement",
                },
                expression: false,
                generator: false,
                id: null,
                params: [],
                type: "FunctionExpression",
              },
              type: "VariableDeclarator",
            },
          ],
          kind: "const",
          type: "VariableDeclaration",
        },
      ],
      sourceType: "script",
      type: "Program",
    };

    expect(tree1.body[0].type).toBe("VariableDeclaration");
    expect(tree1.body[0].kind).toBe("const");
    expect(tree1.body[0].declarations[0].type).toBe("VariableDeclarator");
    expect(tree1.body[0].declarations[0].id.name).toBe("f");
    expect(tree1.body[0].declarations[0].init.type).toBe("FunctionExpression");
    expect(tree1.body[0].declarations[0].init.id.name).toBe("a");

    expect(tree2.body[0].type).toBe("VariableDeclaration");
    expect(tree2.body[0].kind).toBe("const");
    expect(tree2.body[0].declarations[0].type).toBe("VariableDeclarator");
    expect(tree2.body[0].declarations[0].id.name).toBe("f");
    expect(tree2.body[0].declarations[0].init.type).toBe("FunctionExpression");
    expect(tree2.body[0].declarations[0].init.id).toBe(null);
  });

  it("ExpressionStatement", () => {
    const code = "console.log(add(1 + 2, 3 + 4));";
    const _tree = {
      body: [
        {
          expression: {
            arguments: [
              {
                arguments: [
                  {
                    left: { raw: "1", type: "Literal", value: 1 },
                    operator: "+",
                    right: { raw: "2", type: "Literal", value: 2 },
                    type: "BinaryExpression",
                  },
                  {
                    left: { raw: "3", type: "Literal", value: 3 },
                    operator: "+",
                    right: { raw: "4", type: "Literal", value: 4 },
                    type: "BinaryExpression",
                  },
                ],
                callee: { name: "add", type: "Identifier" },
                type: "CallExpression",
              },
            ],
            callee: {
              computed: false,
              object: { name: "console", type: "Identifier" },
              property: { name: "log", type: "Identifier" },
              type: "MemberExpression",
            },
            type: "CallExpression",
          },
          type: "ExpressionStatement",
        },
      ],
      sourceType: "script",
      type: "Program",
    };
    const tree = ast(code);

    expect(tree.body[0].type).toBe("ExpressionStatement");
    expect(tree.body[0].expression.type).toBe("CallExpression");
    expect(tree.body[0].expression.callee.type).toBe("MemberExpression");
    expect(tree.body[0].expression.callee.object.name).toBe("console");
    expect(tree.body[0].expression.callee.property.name).toBe("log");
    expect(tree.body[0].expression.arguments[0].type).toBe("CallExpression");
    expect(tree.body[0].expression.arguments[0].arguments[0].left.value).toBe(
      1
    );
    expect(tree.body[0].expression.arguments[0].arguments[0].right.value).toBe(
      2
    );
    expect(tree.body[0].expression.arguments[0].arguments[0].operator).toBe(
      "+"
    );
    expect(tree.body[0].expression.arguments[0].arguments[1].type).toBe(
      "BinaryExpression"
    );
    expect(tree.body[0].expression.arguments[0].arguments[1].left.value).toBe(
      3
    );
    expect(tree.body[0].expression.arguments[0].arguments[1].right.value).toBe(
      4
    );
    expect(tree.body[0].expression.arguments[0].arguments[1].operator).toBe(
      "+"
    );
  });
});
