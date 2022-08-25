module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    'vuetify/lib(.*)': '<rootDir>/node_modules/vuetify/es5$1',
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
}
