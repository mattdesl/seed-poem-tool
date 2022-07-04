import attachFastClick from "fastclick";
import App from "./App.svelte";

// import {
//   createEthereumWallet,
//   createTezosWallet,
//   validateMnemonic,
// } from "./util/wallet.bundled.js";

// (async () => {
//   const expected = {
//     mnemonic:
//       "stick attend canyon tray wisdom tobacco reveal trigger earn exhaust hazard fluid",
//     passphrase: "",
//     privateKey:
//       "edskSB1X9zwHssYiGFREFhK1zTgSSfjh58WmjvZPr3PWpKAdSquZxtPw996ZWuS645akADWp9EX6W3nV9rNSeWvtpgvWvNQ2Pt",
//     publicKey: "edpktfa9vrACQYZDoHw8viLrpQx5v93TMTXRa3DdZn3euwtHrXqH6e",
//     publicKeyHash: "tz1ggivFLf9EsPBaNaN8WL2yHQaGxBw74J2A",
//   };
//   const phrase =
//     "stick attend canyon tray wisdom tobacco reveal trigger earn exhaust hazard fluid";
//   const obj = await createTezosWallet(phrase);
//   console.log(obj);
//   const obj2 = await createEthereumWallet(phrase);
//   console.log(obj2);
//   console.log(validateMnemonic(phrase));
// })();

attachFastClick(document.body);

const app = new App({
  target: document.body,
});

export default app;
