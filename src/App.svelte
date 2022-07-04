<script>
  import { onMount } from "svelte";

  import RND from "canvas-sketch-util/random";
  import { pick, split, normalize, isChar, validText } from './util';
  
  import {
    createTezosWallet,
    createEthereumWallet,
    generateMnemonic,
    validateMnemonic,
    wordlists
  } from './util/wallet.bundled.js';

  let poem = `caught under bamboo breeze
gentle summer melody
another moment someone will remember`.trim();

  let iters = 0;
  const input = 'ecdsa';
  const iter = async () => {
    const mn = generateMnemonic(160)
    const w = await createEthereumWallet(mn)
    iters++;
    if (iters%100==0) console.log('Iter', iters);
    if (w.address.substring(2).toLowerCase().startsWith(input)) {
      console.log("MATCH");
      console.log('seed:', mn);
      console.log('address:', w.address)
      console.log('private:', w.privateKey)
      console.log('public:', w.publicKey)
    } else {
      setTimeout(() => {
        iter();
      });
    }
  }
  
  iter();


  const getSubstitutions = (poem, start, end) => {
    const validSet = [];
    for (let i = 0; i < wordlists.EN.length; i++) {
      const w = wordlists.EN[i];
      const newPoem = poem.slice(0, start) + w + poem.slice(end);
      if (validateMnemonic(split(newPoem).join(' '))) {
        validSet.push(w);
      }
    }
    return validSet;
  }


  let textArea;
  let wordCount;
  let valid;
  let canGenerate;
  let checksums;
  let missingWords;
  let lastToken;
  let address, privateKey, publicKey;
  let lastPoem;
  let substitutions = [];
  let subsOpen = false;
  let selectionStart = 0;
  let selectionEnd = 0;
  let hasSelection = false;
  let selectedWord = '', selectedWordStart=-1, selectedWordEnd=-1;
  let currentBlockchain = 'tezos';
  let lastGeneratedPoem = null;

  const validWordCount = c => c == 12 || c == 15 || c == 18 || c == 21 || c == 24;

  onMount(() => {
    selectionChange()
    // select()
  })

  // $: poem = poem.toLowerCase()
  $: {
    const t = split(poem);
    wordCount = t.length;
    lastToken = t[t.length-1];
  }
  $: missingWords = getMissingWords(poem);
  $: {
    canGenerate = validWordCount(wordCount) && validText(poem) && missingWords.length === 0;
    valid = canGenerate && validateMnemonic(normalize(poem));
    if (canGenerate) updateWallet();
    selectionChange();
  }

  $: {
    if (currentBlockchain) {
      lastGeneratedPoem = null;
      updateWallet()
    }
  }

  // $: poem, selectionChange()

  // $: checksums = getChecksums(poem);
  
  function updateSubstitutions () {
    if (selectedWord && selectedWordStart >= 0 && selectedWordEnd >= 0) {
      const val = textArea.value;
      const start = selectedWordStart;
      const end = selectedWordEnd;
      substitutions = getSubstitutions(val, start, end);
    }
  }

  function getExplorer (address) {
    if (currentBlockchain === 'ethereum') return `https://etherscan.io/address/${address}`;
    else if (currentBlockchain === 'tezos') return `https://tzkt.io/${address}`;
    else return `https://www.google.ca/search?q=${address}`
  }

  async function updateWallet () {
    const np = normalize(poem);
    if (np !== lastGeneratedPoem) {
      lastGeneratedPoem = np;
      let w;
      if (valid && currentBlockchain === 'ethereum') w = await createEthereumWallet(np);
      else if (valid && currentBlockchain === 'tezos') w = await createTezosWallet(np);
      else w = {};
      publicKey = w.publicKey;
      privateKey = w.privateKey;
      address = w.address;
    }
  }

  function getMissingWords (poem) {
    const tokens = split(poem).filter(t => !wordlists.EN.includes(t));
    return tokens;
  }

  function ellipse (words) {
    const text = words.join(', ');
    if (text.length < 15) return text;
    return text.slice(0, 12) + '...';
  }


  function randomPoem() {
    const words = generateMnemonic(128).split(" ");
    const target = 12;
    let count = 0;
    let wIndex = 0;
    const lines = [];
    for (let line = 0; line < 3; line++) {
      let tCount = 1;
      let remaining = Math.max(0, target - count);

      if (line < 1) {
        tCount = RND.rangeFloor(2, 4);
      } else if (line == 1) {
        tCount = RND.rangeFloor(4, 7);
      } else {
        tCount = remaining;
      }

      const tokens = [];
      for (let t = 0; t < remaining && t < tCount && wIndex < words.length; t++) {
        const t = words[wIndex++];
        tokens.push(t);
      }
      lines.push(tokens);
      count += tCount;
    }
    return lines.map((t) => t.join(" ")).join("\n");
  }

  const checksumRoutineLast = tokens => {
    const validSet = [];
    for (let i = 0; i < wordlists.EN.length; i++) {
      const w = wordlists.EN[i];
      const t = tokens.slice();
      t.push(w);
      if (validateMnemonic(t.join(' '))) {
        validSet.push(w);
      }
    }
    return validSet;
  }

  function getChecksums (poem) {
    const tokens = split(poem);
    if (missingWords.length > 0) return [];
    if (validateMnemonic(tokens.join(' '))) {
      return [];
    } else {
      let start = textArea.selectionStart;
      const [wStart, wEnd] = getWordBoundsAtPosition(poem, start)
      const curWord = poem.slice(wStart, wEnd).trim().toLowerCase();

      const validSet = checksumRoutineLast(tokens.slice(0, tokens.length - 1));
      // const validSet = checksumRoutineMiddle(poem, wStart, wEnd)
      return validSet;
    }
  }

  function randomize () {
    // poem = generateMnemonic(128);
    poem = randomPoem();
    selectionChange()
  }

  function lastWord () {
    const tokens = split(poem);
    return tokens.length ? tokens[tokens.length - 1] : '';
  }

  function getWordBoundsAtPosition(str, position) {
    let start = position - 1;
    let end = position;

    while (start >= 0 && isChar(str[start])) {
      start -= 1;
    }
    start = Math.max(0, start + 1);

    while (end < str.length && isChar(str[end])) {
      end += 1;
    }
    end = Math.max(start, end);

    return [start, end];
  }

  function previous () {
    if (!textArea) return;
    let start = textArea.selectionStart;
    const txt = poem;
    let b = getWordBoundsAtPosition(txt, start);
    start = b[0] - 1;
    start--;
    while (start >= 0 && !isChar(txt[start])) {
      start--;
    }
    start = Math.max(0, start + 1);

    const [wStart, wEnd] = getWordBoundsAtPosition(txt, start);
    textArea.setSelectionRange(wStart, wEnd);
    textArea.focus();
    selectionChange();
  }


  function next () {
    if (!textArea) return;
    let start = textArea.selectionStart;
    const txt = poem;
    let b = getWordBoundsAtPosition(txt, start);
    
    start = b[0];
    let end = b[1];
    end++;

    while (end < txt.length && !isChar(txt[end])) {
      end += 1;
    }
    end = Math.max(start, end);

    const [wStart, wEnd] = getWordBoundsAtPosition(txt, end);
    textArea.setSelectionRange(wStart, wEnd);
    textArea.focus();
    selectionChange();
  }

  function select () {
    if (!textArea) return;
    let start = textArea.selectionStart;

    const [wStart, wEnd] = getWordBoundsAtPosition(poem, start)
    if (wStart === wEnd) {
      previous();
    } else {
      textArea.setSelectionRange(wStart, wEnd);
      textArea.focus();
      selectionChange();
    }
  }

  function shuffle () {
    if (!textArea || !selectedWord && hasSelection) return;
    let start = textArea.selectionStart;

    const tokens = split(poem);
    const lastToken = tokens[tokens.length-1];
    const lastTokenIndex = poem.toLowerCase().lastIndexOf(lastToken);
    const [wStart, wEnd] = getWordBoundsAtPosition(poem, start)
    const curWord = poem.slice(wStart, wEnd).trim().toLowerCase();

    // const WL = wordlists.EN;
    // let newWord;
    // if (wStart === lastTokenIndex) {
    //   const validSet = checksumRoutineLast(tokens.slice(0, tokens.length - 1));
    //   if (validSet.length === 0) {
    //     newWord = pick(WL)
    //   } else {
    //     newWord = pick(validSet)
    //   }
    //   start = lastTokenIndex;
    // } else {
      // newWord = pick(WL);
    // }

    
    // const val = textArea.value;
    start = wStart;
    const end = wEnd;

    // substitutions = getSubstitutions(val, start, end)
    // textArea.setSelectionRange(start, end)
    // selectionChange()
    // updateSubstitutions()
    doSubstitute(pick(substitutions));
  }

  function haiku () {

  }

  function doSubstitute (word) {
    if (selectedWord && selectedWordStart >= 0 && selectedWordEnd >= 0) {
      poem = poem.slice(0, selectedWordStart) + word + poem.slice(selectedWordEnd);
      const start = selectedWordStart;
      const end = start + word.length;
      textArea.value = poem;
      // var event = document.createEvent('TextEvent');
      // event.initTextEvent('textInput', true, true, null, poem, 9, "en-US");
      textArea.setSelectionRange(start, end)
      textArea.focus();
    }
    // const t = split(poem);
    // const lastToken = t[t.length - 1];
    // const idx = poem.toLowerCase().lastIndexOf(lastToken)
    // if (idx >= 0) {
    //   poem = poem.slice(0, idx) + c + poem.slice(idx + lastToken.length);
    // }
  }

  function selectionChange () {
    if (!textArea) return;
    const newStart = textArea.selectionStart;
    const newEnd = textArea.selectionEnd;

    let change = false;

    if (newStart !== selectionStart) {
      change = true;
      selectionStart = newStart;
    }

    if (newEnd !== selectionEnd) {
      change = true;
      selectionEnd = newEnd;
    }

    hasSelection = selectionEnd !== selectionStart;

    if (poem !== lastPoem) {
      change = true;
      lastPoem = poem;
    }

    if (change) {
      const tokens = split(poem);
      const [wStart, wEnd] = getWordBoundsAtPosition(poem, selectionStart)
      let oldStart = selectedWordStart;
      let oldEnd = selectedWordEnd;
      let oldWord = selectedWord;
      selectedWordStart = wStart;
      selectedWordEnd = wEnd;
      selectedWord = poem.slice(wStart, wEnd).trim().toLowerCase();
      if (hasSelection) {
        // console.log("UPDATE SUB")
        updateSubstitutions();
      }
    }
  }
</script>

<main>
  <h1>seed poem editor</h1>
  <div class='info credits'>
    <p>created by <a href="https://twitter.com/mattdesl" target="_blank">mattdesl</a></p>
  </div>

  <p>
    A <em>seed poem</em> is a small 12 to 24 word poem that is also a valid
    <a href="https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"
      target="_blank">
      BIP-39 mnemonic</a> seed phrase, and therefore provides the reader full access to a cryptocurrency wallet.
  </p>

  <p>Each word in the poem must be present in the <a href="https://github.com/bitcoin/bips/blob/34d211aa93931fa9edb6daee98499c68c7ac0b60/bip-0039/english.txt" target="_blank">
      fixed list of 2048 words</a>, and the final word must be a checksum of the entropy of all preceding words.</p>

  <p class='note'>Note: This is an experiment in constrained poetry, and not a secure method to store private keys.</p>

  <div class='textbox'>
    <textarea
      class:invalid={!valid} rows="6" cols="50" bind:this={textArea} bind:value={poem}
      on:input={selectionChange}
      on:mousedown={selectionChange}
      on:mouseup={selectionChange}
      on:click={selectionChange}
      on:touchstart={selectionChange}
      on:keydown={selectionChange}
      on:paste={selectionChange}
      on:cut={selectionChange}
      on:mousemove={selectionChange}
      on:select={selectionChange}
      on:selectstart={selectionChange} />

    <div class='tools'>
      <div class='tool-buttons'>
        <!-- <button on:click={haiku}>randomize</button> -->
        <button on:click={previous}>←</button>
        <button on:click={select}>●</button>
        <button on:click={next}>→</button>
        <div class='button-spacer'></div>
        <button on:click={randomize} class='random'>random poem</button>
        <!-- <button disabled={!hasSelection} on:click={ev => {
          ev.preventDefault();
          shuffle()
        }}>shuffle</button> -->
      </div>
      <div class='word-count' class:invalid={!validWordCount(wordCount)}>
        {wordCount} words
      </div>
    </div>
  </div>

  <div class='info'>
    <div class='info-row'>
      <div class='info-label'>Validation</div>
      {#if !valid}
        {#if !validText(poem)}
          <div class='info-error'>text must only use letter characters</div>
        {:else if missingWords.length > 0}
          <div class='info-error'>some words do not appear in wordlist: <strong>{ellipse(missingWords)}</strong></div>
          {:else if !validWordCount(wordCount)}
            <div class='info-error'>poem word count must be 12, 15, 18, 21, or 24</div>
        {:else}
          <div class='info-error'>invalid checksum: <strong>{lastWord()}</strong></div>
        {/if}
      {:else}
        <div class='info-content validation' class:valid={valid}>{valid?'valid':'invalid'}</div>
      {/if}
    </div>

    <!-- <div class='info-row'>
      <div class='info-label'>Word Count</div>
      <div class='info-content padright' class:invalid={wordCount < 12 || wordCount > 24}>{wordCount}</div>
    </div> -->

    <!-- <div class='info-row'>
      <div class='hr'></div>
    </div> -->

    <div class='info-row'>
      <div class='info-label'>Blockchain</div>
      <div class='info-content key'>
        <select bind:value={currentBlockchain}>
          <option value='ethereum'>Ethereum</option>
          <option selected={true} value='tezos'>Tezos</option>
        </select>
      </div>
    </div>
    <div class='info-row'>
      <div class='info-label'>Private Key</div>
      {#if valid && privateKey}<div class='info-content key' title={privateKey}>{privateKey}</div>
      {:else}<div class='info-content'>—</div>{/if}
    </div>
    <div class='info-row'>
      <div class='info-label'>Public Key</div>
      {#if valid && publicKey}<div class='info-content key' title={publicKey}>{publicKey}</div>
      {:else}<div class='info-content'>—</div>{/if}
    </div>
    <div class='info-row'>
      <div class='info-label'>Address</div>
      {#if valid && address}<div class='info-content'><a href={getExplorer(address)} target="_blank">{address}</a></div>
      {:else}<div class='info-content'>—</div>{/if}
    </div>

    <div class='info-row'>
      <div class='hr'></div>
    </div>

    <div class='info-row'>
      <div class='info-label'>Substitutions</div>
      <div class='info-content substitions-box'>
        {#if substitutions && substitutions.length > 0 && selectedWord && selectionStart !== selectionEnd}
        <div class='info-content substitution-header'>
          {selectedWord}
        </div>
        <div class='info-content checksums'>
          {#each substitutions as c}
            <button class='checksum-button' on:click={() => doSubstitute(c)}>{c}</button>
          {/each}
        </div>
        {:else}
        <div class='info-content'><em>highlight a word to find valid substitutions...</em></div>
        {/if}
      </div>
    </div>
  </div>

  
</main>


<style>
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 300;
    font-style: normal;
    src: url('/src/fonts/SpaceGrotesk-Light.ttf');
  }
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 400;
    font-style: normal;
    src: url('/src/fonts/SpaceGrotesk-Regular.ttf');
  }
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 500;
    font-style: normal;
    src: url('/src/fonts/SpaceGrotesk-Medium.ttf');
  }
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 600;
    font-style: normal;
    src: url('/src/fonts/SpaceGrotesk-SemiBold.ttf');
  }
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 700;
    font-style: normal;
    src: url('/src/fonts/SpaceGrotesk-Bold.ttf');
  }

  @font-face {
    font-family: 'Space Mono';
    font-weight: 400;
    font-style: normal;
    src: url('/src/fonts/SpaceMono-Regular.ttf');
  }
  @font-face {
    font-family: 'Space Mono';
    font-weight: 600;
    font-style: normal;
    src: url('/src/fonts/SpaceMono-Bold.ttf');
  }
  :global(body) {
    padding: 20px;
    margin: 0;
    background: #e8d4cf;
    /* font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; */
    font-family: "Space Grotesk", monospace;
    font-size: 14px;
  }

  :global(html) {
    width: 100%;
  }

  :global(a), :global(a:active), :global(a.visited) {
    color: #260ced;
  }

  main {
    max-width: 640px;
  }

  .note {
    font-size: 12px;
  }

  .info {
    margin-top: 20px;
  }
  .word-count {
    font-size: 12px;
  }

  .tools {
    display: flex;
    width: 100%;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
  }

  .tool-buttons {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
  }

  .tool-buttons button {
    margin-right: 5px;
    border: 1px solid black;
    cursor: pointer;
    outline: none;
    appearance: none;
    background: none;
    border-radius: 2.5px;
    font-size: 12px;
    width: 24px;
    height: 24px;
    /* padding: 10px; */
    box-sizing: border-box;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  .tool-buttons button.random {
    width: initial;
    height: 24px;
  }
  .button-spacer {
    width: 5px;
    content: ' ';
  }

  .info-content.key {
    white-space: nowrap;
    overflow: hidden;
    max-width: 50%;
    text-overflow: ellipsis;
  }
  .info-row {
    font-size: 12px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
    margin-top: 10px;
  }
  .info-row:first-child {
    margin-top: 0px;

  }
  .padright {
    margin-right: 10px;
  }

  .hr {
    width: 95px;
    height: 1px;
    /* background: rgba(0,0,0,0.1); */
    content: ' ';
    margin: 0;
    padding: 0;
    margin-top: 5px;
  }

  .checksum-button {
    border: none;
    outline: none;
    appearance: none;
    padding: 0;
    margin: 0;
    background: none;
    margin: 2.5px;
    text-decoration: underline;
    cursor: pointer;
  }
  .checksum-button::after {
    content: ',';
  }
  .checksum-button:last-child::after {
    content: ' ';
  }
  .substitions-box {
    min-width: 200px;
    width: 75%;
    /* min-height: 200px; */
    /* position: relative; */
    /* top: -5px; */
  }
  .substitution-header {
    border: 1px solid black;
    border-bottom: none;
    padding: 5px 10px;
    background: black;
    color: white;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .checksums {
    min-width: 100px;
    
    /* width: 50%; */
    overflow-y: scroll;
    height: 125px;
    padding: 10px;
    border: 1px solid black;
    border-radius: 4px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    /* resize: both; */

    /* display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row; */
  }
  .checksums .subcontent {
    /* width: 100%; */
  }

  .info-label {
    font-weight: bold;
    /* text-align: right; */
    width: 115px;
  }

  .info-content {
  }

  .info-content.validation.valid {
    color: green;
  }
  .info-content.validation {
    color: #c71d0a;
  }
  .info-content.invalid, .word-count.invalid {
    color: #c71d0a;
  }
  .info-error {
    color: #c71d0a;
    font-size: 11px;
  }
  .valid {
    margin-left: 0;
  }

  h1, h2 {
    padding: 0;
    margin: 0;
    line-height: 1;
    font-weight: 200;
  }

  h2 {
    margin-top: 20px;
  }
  .textbox {
    min-width: 0;
    max-width: 100%;
    width: 400px;
    /* flex-basis: 400px; */
    /* width: 60%; */
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
  }

  textarea {
    margin: 0;
    text-transform: lowercase;
    padding: 10px;
    box-sizing: border-box;
    flex: 1;
    resize: none;
    width: 100%;
    background: none;
    max-width: 100%;
    border: 1px solid rgba(0,0,0,0.25);
    /* border: 1px dotted black; */
    border-radius: 3px;
    margin-bottom: 5px;
    margin-top: 10px;
    overflow: auto;
  }
  textarea.invalid {
    border-color: #c71d0a;
  }
  textarea:focus {
    outline: none;
  }
  .info.credits {
    margin-top: 0px;
    font-size: 11px;
    margin-bottom: 20px;
  }
  .credits p {
    margin: 0;
    margin-top: 10px;
  }
  .error-wordcount {
    font-size: 10px;
    display: inline-block;
    color: #c71d0a;
  }
  .word-count.invalid {
    color: #c71d0a;
  }
</style>