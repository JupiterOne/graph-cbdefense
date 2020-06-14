const { defaults } = require("jest-config");

module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/CbDefenseClient.ts",
    "!src/util/axios-util.ts",
  ],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.env.js"],
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 94.59,
      functions: 100,
      lines: 100,
    },
  },
};
