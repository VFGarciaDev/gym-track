import antfu from "@antfu/eslint-config"

export default antfu(
  {
    formatters: true,
    ignores: ["get_network_local_ip.js", "node_modules", "dist", ".expo", "android", "ios"],
    react: true,
    rules: {
      "antfu/if-newline": ["off"],
      "no-console": ["warn"],
      "no-unused-vars": "off",
      "node/prefer-global/process": ["off"],
      "perfectionist/sort-array-includes": ["warn"],
      "perfectionist/sort-imports": [
        "warn",
        {
          customGroups: [],
          groups: [
            "type-import",

            "value-builtin", // node built-ins (fs, path, etc)
            "value-external", // node_modules
            "value-internal", // @alias ou ~ alias
            ["value-parent", "value-sibling", "value-index"], // ./ ../

            "unknown",
          ],
          ignoreCase: true,
          internalPattern: ["^@/.+"],
          newlinesBetween: 1,
          order: "asc",
          partitionByNewLine: false,
          specialCharacters: "keep",
          type: "alphabetical",
        },
      ],
      // "perfectionist/sort-objects": ["warn"],
      "react-dom/no-dangerously-set-innerhtml": ["off"],
      "react-hooks-extra/no-direct-set-state-in-use-effect": ["off"],
      "react-refresh/only-export-components": ["off"],
      "react/no-array-index-key": ["off"],
      "react/no-nested-component-definitions": ["off"],
      "react/no-nested-components": ["off"],
      "react/no-use-context": ["off"],
      "style/arrow-parens": ["warn", "as-needed"],
      "style/brace-style": ["off"],
      "style/comma-dangle": ["off"],
      "style/eol-last": ["warn", "always"],
      "style/jsx-one-expression-per-line": ["off"],
      "style/multiline-ternary": ["off"],
      "style/no-trailing-spaces": ["off"],
      "style/operator-linebreak": ["off"],
      "style/quote-props": ["off"],
      "ts/ban-ts-comment": ["off"],
      "ts/consistent-type-definitions": ["error", "type"],
      "ts/explicit-function-return-type": "off",
      "ts/no-explicit-any": "warn",
      "ts/no-unused-vars": "off",
      "ts/no-use-before-define": ["off"],
      "unicorn/new-for-builtins": "off",
      "unicorn/prefer-node-protocol": ["off"],
      "unicorn/throw-new-error": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
    stylistic: {
      quotes: "double",
      semi: false,
    },
    type: "app",

    typescript: true,
  },
  {
    files: ["**/types/**/*.ts"],
    rules: {
      "unused-imports/no-unused-vars": ["off"],
    },
  },
)
