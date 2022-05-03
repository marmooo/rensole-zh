import { readLines } from "https://deno.land/std/io/mod.ts";
import pinyin from "https://esm.sh/pinyin@2.11.0";

async function loadJiebaDict() {
  const dict = [];
  const fileReader = await Deno.open("jieba/extra_dict/dict.txt.big");
  for await (const line of readLines(fileReader)) {
    const arr = line.split(" ");
    const word = arr[0];
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

async function build(grades, threshold) {
  const words = [];
  const poses = [];
  const jiebaDict = await loadJiebaDict();
  let gradePos = 0;
  for (let i = 0; i < jiebaDict.length; i++) {
    if (i >= threshold) break;
    const word = jiebaDict[i][0];
    if (word.length == 1) continue;
    if (i == grades[gradePos] - 1) {
      poses.push(words.length);
      gradePos += 1;
    }
    const yomis = pinyin(word);
    if (yomis.length > 0) {
      const yomi = yomis.join(" ");
      words.push(`${word}\t${yomi}`);
    } else {
      console.log(`error: ${word}`);
    }
  }
  return [words, poses];
}

const grades = [1000, 3000, 5000, 10000];
const threshold = 10000;
const [words, poses] = await build(grades, threshold);
const result = poses.join(",") + "\n" + words.join("\n");
Deno.writeTextFileSync("src/pronounce.tsv", result);
