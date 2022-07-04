import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import inject from "@rollup/plugin-inject";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // "readable-stream": "vite-compatible-readable-stream",
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
  // optimizeDeps: {
  // 	esbuildOptions: {
  // 		define: {
  // 			global: 'globalThis',
  // 		},
  // 		inject: ['./src/buffer-shim.js'],
  // 		// plugins: [esbuildCommonjs(['crypto-browserify'])],
  // 	},
  // },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {},
  },
});
