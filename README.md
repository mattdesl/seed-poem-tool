# seed-poem-tool

This is a frontend tool to help you craft valid _seed poems_.

A seed poem is a small 12 to 24 word poem that is also a valid [BIP-39 mnemonic](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase, and therefore provides the reader full access to a cryptocurrency wallet.

Each word in the poem must be present in the [fixed list of 2048 words](https://github.com/bitcoin/bips/blob/34d211aa93931fa9edb6daee98499c68c7ac0b60/bip-0039/english.txt), and the final word must be a checksum of the entropy of all preceding words.

_Note:_ This is an experiment in constrained poetry, and not a secure method to store private keys.

### default poem

The default poem for the app is a 12-word haiku that is also a valid seed phrase:

```sh
caught under bamboo breeze
gentle summer melody
another moment someone will remember
```

This encodes to the Tezos wallet [tz1Poffo6xjvjBnPUrdUxWvJ76rhN6W39ZZf](https://tzkt.io/tz1Poffo6xjvjBnPUrdUxWvJ76rhN6W39ZZf/operations/) which was used temporarily to store _\[tap\]_—a visual poem, cryptographic puzzle, and non-fungible token. You can read more about it [in this thread](https://twitter.com/mattdesl/status/1540001119237275649).

### dev

To develop the site:

```sh
npm i
npm run dev
```

### build

To build the site:

```sh
npm run build
```

Note the `wallet.js` has to be pre-build using `esbuild` due to a Vite bug with readable-stream. You can do this with the following:

```sh
npm run bundle-util
```

If you run into an error with `"path"` module you may need to make sure that `node_modules/libsodium-sumo/package.json` includes the following section before bundling this utility:

```js
  "browser": {
    "fs": false,
    "path": "path-browserify"
  }
```

(Yes, it's clunky...)

### live demo

:sparkles:

You can see a live version of the app here:

https://seed-poem-tool.netlify.app/
