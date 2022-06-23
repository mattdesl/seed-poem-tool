import attachFastClick from "fastclick";
import App from "./App.svelte";
// import { createWallet, generateMnemonic } from "./wallet";

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
//   const obj = await createWallet(
//     "stick attend canyon tray wisdom tobacco reveal trigger earn exhaust hazard fluid"
//   );
//   console.log(JSON.stringify(obj) === JSON.stringify(expected));
// })();

attachFastClick(document.body);

const app = new App({
  target: document.body,
});

export default app;
