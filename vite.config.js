import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util",
      // web3: path.resolve(__dirname, "./node_modules/web3/dist/web3.min.js"),
    },
  },
  define: {
    global: "window",
    // "process.env": {},
  },
  build: {
    sourcemap: true,
  },
});
