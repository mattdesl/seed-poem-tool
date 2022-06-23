import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import inject from "@rollup/plugin-inject";

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
    sourcemap: false,
    minify: false,
    rollupOptions: {
      plugins: [
        inject({
          modules: { Buffer: ["buffer", "Buffer"] },
        }),
        {
          name: "no-treeshake",
          transform(_, id) {
            if (id.includes("buffer")) {
              return { moduleSideEffects: "no-treeshake" };
            }
            if (id.includes("stream")) {
              return { moduleSideEffects: "no-treeshake" };
            }
            if (id.includes("browserify")) {
              return { moduleSideEffects: "no-treeshake" };
            }
          },
        },
      ],
    },
  },
});
