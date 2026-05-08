import js from "@eslint/js";
import globals from "globals";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    ignores: ["node_modules/**", "uploads/**"],
  },
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "multer",
          property: "diskStorage",
          message:
            "Asegúrate de especificar 'limits' en tu configuración de Multer.",
        },
      ],
      "require-atomic-updates": "warn",
    },
  },
];
