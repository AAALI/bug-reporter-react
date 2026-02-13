import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  noExternal: ["@quick-bug-reporter/core"],
  treeshake: true,
  splitting: false,
  banner: {
    js: '"use client";',
  },
});
