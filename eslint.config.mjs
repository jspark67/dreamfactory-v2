import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  {
    ignores: [
      "backend/.venv/**",
      "veo-studio/dist/**",
      "veo-studio/node_modules/**",
      "veo-studio/.vite/**",
      "veo-studio/src/**",
      "venv/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
