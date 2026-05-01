import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import { customRules } from "../eslint.base.mjs";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: customRules,
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
