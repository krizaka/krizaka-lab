import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Library build configuration for npm package
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        "react/index": path.resolve(__dirname, "src/react/index.ts"),
        "core/index": path.resolve(__dirname, "src/core/index.ts"),
        "native/index": path.resolve(__dirname, "src/native/ReactNativeAdapters.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@krizaka/ui",
        "@krizaka/tokens",
        "@krizaka/icons",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
