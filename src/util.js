export function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export const normalize = (poem) =>
  poem
    .toLowerCase()
    .replace(/[\-\–\—\,\!\:\?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export const split = (poem) => normalize(poem).split(/\s/g);
export const validText = (poem) => /^[a-z\s\,\-\–\—\!\:\?]+$/gi.test(poem);
export const isSpace = (c) => /[\,\-\–\—\!\:\?\s]/.test(c);
export const isChar = (c) => /[a-z]/.test(c);
