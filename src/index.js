import { escapeSql } from "https://deno.land/x/escape/mod.ts";
import { createDbWorker } from "../node_modules/sql.js-httpvfs/dist/index.js";

let audioContext;
const audioBufferCache = {};
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("correct", "mp3/correct3.mp3");
    loadAudio("incorrect", "mp3/incorrect1.mp3");
  }
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function loadGrade() {
  const grade = localStorage.getItem("rensole-zh");
  if (grade) {
    const obj = document.getElementById("grade");
    [...obj.options].forEach((g) => {
      if (g.value == grade) {
        g.selected = true;
      } else {
        g.selected = false;
      }
    });
  }
}

function getWordVector(lemma) {
  return rensoleWorker.db.query(
    `SELECT * FROM magnitude WHERE key="${escapeSql(lemma)}"`,
  ).then((row) => {
    if (row[0]) {
      const vector = new Array(300);
      for (const [k, v] of Object.entries(row[0])) {
        if (k.startsWith("dim_")) {
          const pos = parseInt(k.slice(4));
          vector[pos] = v;
        }
      }
      return vector;
    }
  });
}

function getSiminyms(lemma) {
  return siminymWorker.db.query(
    `SELECT words FROM siminyms WHERE lemma="${escapeSql(lemma)}"`,
  ).then((row) => {
    if (row[0]) {
      const words = JSON.parse(row[0].words);
      return words.reverse();
    }
  });
}

function showHint(hint) {
  let html = "";
  if (Object.keys(hint).length == 0) return html;
  const m = (hint.type == "word") ? 2 : 4;
  const n = (hint.type == "word") ? 1 : 3;
  const text = hint.text;
  for (let i = 0; i < text.length; i++) {
    if (text[i] == hint.target[i]) {
      html += `<span class="hint${m}">${text[i]}</span>`;
    } else {
      html += `<span class="hint${n}">${text[i]}</span>`;
    }
  }
  return html;
}

function pronounceHint(count) {
  if (count == 1) {
    const poses = pronounce.map((str, i) => [str, i])
      .filter((x) => !/^[a-z]$/.test(x[0]))
      .map((x) => x[1]);
    const pos = poses[getRandomInt(0, poses.length)];
    holedPronounce = pronounce.map((x, i) => {
      return (i == pos) ? x : "?";
    });
    return { text: holedPronounce, type: "pronounce", target: pronounce };
  } else {
    const poses = pronounce.map((str, i) => [str, i])
      .filter((_, i) => holedPronounce[i] == "?")
      .filter((x) => !/^[a-z]$/.test(x[0]))
      .map((x) => x[1]);
    const pos = poses[getRandomInt(0, poses.length)];
    if (pos) holedPronounce[pos] = pronounce[pos];
    return { text: holedPronounce, type: "pronounce", target: pronounce };
  }
}

function wordHint(count) {
  switch (count) {
    case 1: {
      let hint = "";
      for (let i = 0; i < answer.length; i++) {
        hint += "？";
      }
      holedAnswer = hint;
      return { text: hint, type: "word", target: answer };
    }
    case 2: {
      const pos = getRandomInt(0, answer.length);
      holedAnswer = holedAnswer.slice(0, pos) + answer[pos] +
        holedAnswer.slice(pos + 1);
      return { text: holedAnswer, type: "word", target: answer };
    }
    default: {
      if (answer.length > count) {
        const poses = holedAnswer.split("")
          .map((str, i) => [str, i])
          .filter((x) => x[0] == "？")
          .map((x) => x[1]);
        const pos = poses[getRandomInt(0, poses.length)];
        holedAnswer = holedAnswer.slice(0, pos) + answer[pos] +
          holedAnswer.slice(pos + 1);
        return { text: holedAnswer, type: "word", target: answer };
      } else {
        return {};
      }
    }
  }
}

function getHint(replyCount) {
  switch (replyCount) {
    case 1:
      return wordHint(1);
    case 3:
      return pronounceHint(1);
    case 5:
      return wordHint(2);
    case 7:
      return pronounceHint(2);
    case 9:
      return wordHint(3);
    default:
      return {};
  }
}

function showAnswer(cleared) {
  if (cleared) {
    playAudio("correct", 0.3);
  } else {
    playAudio("incorrect", 0.3);
  }
  document.getElementById("answer").classList.remove("d-none");
  const animations = [
    "bounce",
    "rubberBand",
    "flip",
    "rotateIn",
    "swing",
    "tada",
    "heartBeat",
    "jackInTheBox",
  ];
  const animation = animations[getRandomInt(0, animations.length)];
  const classNames = ["animate__animated", `animate__${animation}`];
  const answerText = document.getElementById("answerText");
  answerText.textContent = answer;
  answerText.parentNode.classList.add(...classNames);
  document.getElementById("restart").focus();
}

function norm(vector) {
  let sumOfSquares = 0;
  for (let i = 0; i < vector.length; i++) {
    sumOfSquares += Math.pow(vector[i], 2);
  }
  const result = Math.sqrt(sumOfSquares);
  return result;
}

function dot(vector1, vector2) {
  if (vector1.length !== vector2.length) {
    throw new Error("The vectors have different lengths.");
  }
  let result = 0;
  for (let i = 0; i < vector1.length; i++) {
    result += vector1[i] * vector2[i];
  }
  return result;
}

function search() {
  const searchText = document.getElementById("searchText");
  const word = searchText.value;
  getWordVector(word).then((b) => {
    if (b) {
      document.getElementById("notExisted").classList.add("invisible");
      if (replyCount >= 10) {
        if (word == answer) {
          showAnswer(true);
        } else {
          showAnswer(false);
        }
      } else {
        const a = answerVector;
        const similarity = dot(a, b) / (norm(a) * norm(b));
        const template = document.createElement("template");
        const m = mostSimilars[replyCount];
        const hint = getHint(replyCount);
        template.innerHTML = `
          <tr>
            <td>${word}</td><td>${similarity.toFixed(3)}</td>
            <td>${m[0]}</td><td>${m[1].toFixed(3)}</td>
            <td>${showHint(hint)}</td></td>
          </tr>
        `;
        const renso = document.getElementById("renso");
        const tr = template.content.firstElementChild;
        renso.insertBefore(tr, renso.firstChild);
        if (word == answer) showAnswer(true);
      }
      replyCount += 1;
    } else {
      document.getElementById("notExisted").classList.remove("invisible");
    }
    searchText.value = "";
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function loadProblems() {
  return fetch("pronounce.tsv")
    .then((response) => response.text())
    .then((text) => {
      document.getElementById("loading").classList.remove("d-none");
      const arr = text.trimEnd().split("\n");
      gradePoses = arr[0].split(",").map((x) => parseInt(x));
      arr.slice(1).forEach((line) => {
        vocabularies.push(line.split("\t"));
      });
      loadWorkers();
    });
}

function loadSiminymWorker() {
  let grade = localStorage.getItem("rensole-zh");
  if (!grade) {
    const obj = document.getElementById("grade");
    grade = obj.options[obj.selectedIndex].value;
  }
  const config = {
    from: "jsonconfig",
    configUrl: `/siminym-zh/db/${grade}/config.json`,
  };
  return createDbWorker(
    [config],
    "/siminym-zh/sql.js-httpvfs/sqlite.worker.js",
    "/siminym-zh/sql.js-httpvfs/sql-wasm.wasm",
  );
}

function loadRensoWorker() {
  const config = {
    from: "jsonconfig",
    configUrl: "/rensole-zh/db/config.json",
  };
  return createDbWorker(
    [config],
    "/rensole-zh/sql.js-httpvfs/sqlite.worker.js",
    "/rensole-zh/sql.js-httpvfs/sql-wasm.wasm",
  );
}

function loadProblemVectors() {
  const promises = [
    getSiminyms(answer),
    getWordVector(answer),
  ];
  return Promise.all(promises).then((result) => {
    mostSimilars = result[0];
    answerVector = result[1];
    document.getElementById("searchText").focus();
    document.getElementById("loading").classList.add("d-none");
  });
}

async function changeProblem() {
  document.getElementById("loading").classList.remove("d-none");
  document.getElementById("answer").classList.add("d-none");
  replyCount = 0;
  const pos = getRandomInt(0, problems.length);
  answer = problems[pos][0];
  pronounce = problems[pos][1].replace(/ /g, "").split("");
  const renso = document.getElementById("renso");
  while (renso.firstChild) renso.firstChild.remove();
  await loadProblemVectors();
}

async function loadWorkers() {
  const obj = document.getElementById("grade");
  const pos = gradePoses[obj.selectedIndex];
  problems = vocabularies.slice(0, pos);
  const promises = [
    loadSiminymWorker(),
    loadRensoWorker(),
  ];
  await Promise.all(promises).then((workers) => {
    // if (siminymWorker) {
    //   siminymWorker.db.close();
    //   siminymWorker.worker.terminate();  // TODO: Comlink 4.3.1
    // }
    // if (rensoleWorker) {
    //   rensoleWorker.db.close();
    //   siminymWorker.worker.terminate();  // TODO: Comlink 4.3.1
    // }
    siminymWorker = workers[0];
    rensoleWorker = workers[1];
    changeProblem();
  });
}

function changeGrade() {
  const obj = document.getElementById("grade");
  const grade = obj.options[obj.selectedIndex].value;
  localStorage.setItem("rensole-zh", grade);
  location.reload();
}

const vocabularies = [];
let gradePoses = [];
let problems = [];
let replyCount = 0;
let mostSimilars;
let answerVector;
let answer;
let pronounce;
let holedAnswer;
let holedPronounce;
let rensoleWorker;
let siminymWorker;
loadGrade();
loadProblems();

document.addEventListener("keydown", (event) => {
  if (event.key == "Enter") search();
});
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("search").onclick = search;
document.getElementById("restart").onclick = changeProblem;
document.getElementById("grade").onchange = changeGrade;
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
