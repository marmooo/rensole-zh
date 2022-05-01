import { readLines } from "https://deno.land/std/io/mod.ts";
import pinyin from "https://esm.sh/pinyin@2.11.0";

async function loadJiebaDict() {
  const dict = [];
  const fileReader = await Deno.open("jieba/extra_dict/dict.txt.big");
  for await (const line of readLines(fileReader)) {
    const arr = line.split(" ");
    const word = arr[0];
    if (word.length == 1) continue;
    const count = parseInt(arr[1]);
    dict.push([word, count]);
  }
  dict.sort((a, b) => {
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    return 0;
  });
  return dict;
}

async function build(threshold) {
  const result = [];
  const jiebaDict = await loadJiebaDict();
  jiebaDict.slice(0, threshold).forEach((data) => {
    const word = data[0];
    const yomis = pinyin(word);
    if (yomis.length > 0) {
      const yomi = yomis.join(" ");
      result.push(`${word}\t${yomi}`);
    } else {
      console.log(`error: ${word}`);
    }
  });
  return result;
}

const threshold = 10000;
const result = await build(threshold);
Deno.writeTextFileSync("src/pronounce.tsv", result.join("\n"));
