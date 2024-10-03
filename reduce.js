import { TextLineStream } from "jsr:@std/streams/text-line-stream";

async function loadDict(threshold) {
  const dict = [];
  const file = await Deno.open("jieba/extra_dict/dict.txt.big");
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    const arr = line.split(" ");
    const word = arr[0];
    const count = parseInt(arr[1]);
    if (count > threshold) {
      dict.push([word, count]);
    }
  }
  dict.sort((a, b) => {
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    return 0;
  });
  return dict;
}

const threshold = 99;
const dict = await loadDict(threshold);
const output = dict.map((x) => x.join(",")).join("\n");
Deno.writeTextFileSync("words.lst", output);
