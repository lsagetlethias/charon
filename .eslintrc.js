require("@rushstack/eslint-patch/modern-module-resolution");

/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  reportUnusedDisableDirectives: true,
  extends: [
    "eslint:recommended",
    // default rules for import
    "plugin:import/recommended",
    // include prettier config which avoid conflict
    "prettier",
    // disable conflicting rules with plugin (not config!)
    "plugin:prettier/recommended",
  ],
  plugins: ["import", "prettier", "unused-imports", "simple-import-sort", "lodash"],
  ignorePatterns: ["!**/.*.js?(x)", "node_modules"],
  env: {
    node: true,
  },
  settings: {
    "import/parsers": {
      [require.resolve("@typescript-eslint/parser")]: [".ts", ".mts", ".cts", ".tsx", ".d.ts"],
    },
    "import/resolver": {
      [require.resolve("eslint-import-resolver-node")]: {
        extensions: [".js", ".ts"],
      },
      [require.resolve("eslint-import-resolver-typescript")]: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/order": "off",
    "import/no-default-export": "error",
    "import/no-extraneous-dependencies": "off",
    "import/no-internal-modules": "off",
    "import/newline-after-import": "error",
    "import/export": "off",
    "import/no-useless-path-segments": "warn",
    "import/no-absolute-path": "warn",
    "import/no-named-as-default": "off",
    "import/consistent-type-specifier-style": ["error", "prefer-inline"],
    "import/no-duplicates": [
      "error",
      {
        "prefer-inline": true,
      },
    ],
    "sort-import": "off",
    "lodash/import-scope": ["error", "member"],
    "prettier/prettier": [
      "error",
      {
        tabWidth: 2,
        trailingComma: "all",
        printWidth: 120,
        singleQuote: false,
        parser: "typescript",
        arrowParens: "avoid",
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        // MORE STRICT
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      plugins: ["@typescript-eslint", "typescript-sort-keys"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        warnOnUnsupportedTypeScriptVersion: true,
      },
      rules: {
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": [
          "error",
          {
            default: "array-simple",
          },
        ],
        "no-restricted-imports": "off",
        "@typescript-eslint/no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "react",
                importNames: ["default"],
                message: 'Import "React" par défaut déjà géré par Next.',
                allowTypeImports: true,
              },
            ],
          },
        ],
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/no-unused-vars": "off",
        "typescript-sort-keys/interface": "error",
        "typescript-sort-keys/string-enum": "error",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/explicit-member-accessibility": [
          "error",
          {
            accessibility: "explicit",
            overrides: {
              accessors: "no-public",
              constructors: "no-public",
            },
          },
        ],
        "@typescript-eslint/member-delimiter-style": [
          "off",
          {
            multiline: {
              delimiter: "none",
              requireLast: true,
            },
            singleline: {
              delimiter: "semi",
              requireLast: false,
            },
          },
        ],
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
          },
        ],
        // handled by tsc already (also not working -_-')
        // "import/no-unresolved": "off",
      },
    },
  ],
};

module.exports = config;
