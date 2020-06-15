const { defaults } = require("jest-config");

module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.env.js"],
  clearMocks: true,
};
