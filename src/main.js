import attachFastClick from "fastclick";
import App from "./App.svelte";

attachFastClick(document.body);

const app = new App({
  target: document.body,
});

export default app;
