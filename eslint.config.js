const reactHooks = require("eslint-plugin-react-hooks");
const tsParser = require("@typescript-eslint/parser");

// Deliberately minimal: the one rule family that guards against the
// blank-screen class of bug (hooks after early returns), which no unit
// test can catch because the component layer is untested by design.
module.exports = [
  {
    files: ["src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
