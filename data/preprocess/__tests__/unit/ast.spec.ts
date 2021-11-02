import type {
  Identifier,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
} from "@babel/types";
import { AST } from "../../src/ast";

describe("ast", () => {
  let ast: AST;

  const code = `
    function a(z) {
      let b = function () {
        let c = 1;
      };
      let d = () => {
        let e = 2;
      };
      let f = new Function("{let g = 2;}");
      function h() {}
    }    
    `;

  it("init", () => {
    ast = new AST(code);
    expect(ast.ast.type).toBe("File");
  });

  it("generate", () => {
    const code1 = `let a = 1;`;
    expect(AST.generate(AST.parse(code1))).toBe(code1);
  });

  it("functions", () => {
    const { functions } = ast;
    expect(functions.length).toBe(5);
    const [f0, f1, f2, f3, f4] = functions;
    expect(((f0 as FunctionDeclaration).id as Identifier).name).toBe("a");
    expect((f0 as FunctionDeclaration).type).toBe("FunctionDeclaration");
    expect((f0 as FunctionDeclaration).params.length).toBe(1);

    expect((f1 as FunctionExpression).type).toBe("FunctionExpression");
    expect((f2 as ArrowFunctionExpression).type).toBe(
      "ArrowFunctionExpression"
    );

    expect((f3 as FunctionExpression).type).toBe("FunctionExpression");
    expect((f4 as FunctionDeclaration).type).toBe("FunctionDeclaration");
  });

  it("availableFunctions", () => {
    // console.log(ast.availableFunctions);
  });
});
