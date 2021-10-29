/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  rootDir: ".",
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "/__tests__/.*.spec\\.ts?$",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  globals: {
    "ts-jest": {
      tsconfig: {
        target: "ES2019",
      },
    },
  },
};
