import { defineConfig } from "vite";

/**
 * material-color-utilities publishes extensionless imports meant for a bundler,
 * which Node's ESM loader refuses. Letting Vite resolve it keeps the generator
 * runnable without vendoring or patching the package.
 */
export default defineConfig({
  ssr: { noExternal: ["@material/material-color-utilities"] },
});
