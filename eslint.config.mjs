// ESLint flat config for the simulations workspace.
// The Next.js app (apps/web) is intentionally excluded: `next lint` was removed
// in Next 16, and the app is a thin shell around the simulation packages.
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "apps/**",
      "packages/**"
    ]
  },
  {
    files: ["simulations/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { fixStyle: "inline-type-imports" }
      ]
    }
  }
);
