import sodium from "libsodium-wrappers-sumo";
import bs58check from "bs58check";

import Bip39 from "bip39-light";

import {
  mnemonicToSeed,
  generateMnemonic,
  validateMnemonic,
} from "bip39-light";

import { Wallet } from "@ethersproject/wallet";

export const defaultPath = "m/44'/60'/0'/0/0";
export const wordlists = Bip39.wordlists;

const prefix = {
  tz1: new Uint8Array([6, 161, 159]),
  edsk: new Uint8Array([43, 246, 78, 7]),
  edpk: new Uint8Array([13, 15, 37, 217]),
};

const b58cencode = function (payload, prefixArg) {
  var n = new Uint8Array(prefixArg.length + payload.length);
  n.set(prefixArg);
  n.set(payload, prefixArg.length);
  return bs58check.encode(Buffer.from(n));
};

export async function createEthereumWallet(
  phrase = generateMnemonic(256),
  path = defaultPath
) {
  const w = Wallet.fromMnemonic(phrase, path);
  return {
    mnemonic: phrase,
    privateKey: w.privateKey,
    publicKey: w.publicKey,
    address: w.address,
  };
}

export async function createTezosWallet(mnemonic = generateMnemonic(160)) {
  await sodium.ready;
  const s = mnemonicToSeed(mnemonic).slice(0, 32);
  const kp = sodium.crypto_sign_seed_keypair(new Uint8Array(s));
  return {
    mnemonic,
    privateKey: b58cencode(kp.privateKey, prefix.edsk),
    publicKey: b58cencode(kp.publicKey, prefix.edpk),
    address: b58cencode(
      sodium.crypto_generichash(20, kp.publicKey),
      prefix.tz1
    ),
  };
}

export { validateMnemonic, generateMnemonic };
