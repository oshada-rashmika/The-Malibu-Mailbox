import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";

export const customRules = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["warn"],
  "no-console": "warn",
};

export const baseConfig = ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    rules: customRules,
  }
);
