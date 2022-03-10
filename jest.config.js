module.exports = {
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
