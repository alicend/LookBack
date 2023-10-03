module.exports = {
  testEnvironment: "jsdom",
  verbose: true,
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "\\.(css)$": "<rootDir>/node_modules/jest-css-modules",
    "^@/(.*)$": "<rootDir>/$1",
  },
};
