import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import raw from "./plugin/raw";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    raw({
      fileRegex: /\.md$/,
    }),
  ],
});
