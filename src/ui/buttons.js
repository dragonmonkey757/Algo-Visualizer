// Code written originally, copilot separated into own file

import { editor, SEARCH_STARTER_CODE, STARTER_CODE } from "./editor.js";

const playBtn = document.getElementById("playBtn");
const selectBtn = document.getElementById("selectBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const arrayInput = document.getElementById("arrayInput");
const searchInput = document.getElementById("searchInput");
const searchPresetBtn = document.getElementById("searchPresetBtn");
const output = document.getElementById("output");

const SEARCH_ALGORITHMS = new Set(["linear_search", "binary_search"]);

const algoOptions = [
  { text: "Design your own", algocode: "default_algo" },
  { text: "Bubble Sort", algocode: "bubble_sort" },
  { text: "Insertion Sort", algocode: "insertion_sort" },
  { text: "Selection Sort", algocode: "selection_sort" },
  { text: "Merge Sort", algocode: "merge_sort" },
  { text: "Quick Sort", algocode: "quick_sort" },
  { text: "Purge Sort", algocode: "purge_sort" },
  { text: "Linear Search", algocode: "linear_search" },
  { text: "Binary Search", algocode: "binary_search" }
];

algoOptions.forEach((option) => {
  const optionElement = document.createElement("option");
  optionElement.text = option.text;
  optionElement.value = option.algocode;
  selectBtn.add(optionElement);
});

let isRunning = false;
let isPaused = false;

const SAFETY_MAX_SECONDS = 12;
const SAFETY_MAX_STEPS = 2500;

const defaultArray = [12, 4, 9, 1, 18, 6, 3];
let currentArray = [...defaultArray];

function logOutput(message, isError = false) {
  output.textContent = message;
  output.classList.toggle("error", isError);
}

function reportError(message) {
  logOutput(message, true);
}

function parseArrayInput(value) {

  const parsed = value
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v));

  if (parsed.length === 0) {
    throw new Error("Enter a comma-separated list of numbers, like: 4, 2, 9, 1");
  }

  return parsed;
}

function parseSearchTarget(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    throw new Error("Enter a numeric search target, or leave it blank to auto-pick one.");
  }

  return parsed;
}

function isSearchAlgorithm(algoName) {
  return SEARCH_ALGORITHMS.has(algoName);
}

function updateSearchControls(algoName) {
  const visible = isSearchAlgorithm(algoName);
  searchInput.hidden = !visible;
  searchPresetBtn.hidden = !visible;
  if (!visible) {
    window.searchTarget = null;
    searchInput.dataset.autoTarget = "false";
  }
}

function setSearchTargetFromArray() {
  const values = parseArrayInput(arrayInput.value);
  const target = values[Math.floor(values.length / 2)];
  searchInput.value = String(target);
  window.searchTarget = target;
  searchInput.dataset.autoTarget = "true";
  logOutput(`Search target set to ${target}.`, false);
}

function buildLoadedAlgorithmCode(algoName, algoCode) {
  const starter = isSearchAlgorithm(algoName) ? SEARCH_STARTER_CODE : STARTER_CODE;
  return starter.replace("INSERT_ALGO_HERE", algoName) + "\t\n" + algoCode;
}

function syncSearchTargetToArray() {
  if (!isSearchAlgorithm(selectBtn.value)) {return;}
  if (searchInput.dataset.autoTarget !== "true" && searchInput.value.trim() !== "") {
    return;
  }

  const values = parseArrayInput(arrayInput.value);
  const target = values[Math.floor(values.length / 2)];
  searchInput.value = String(target);
  window.searchTarget = target;
}

updateSearchControls(selectBtn.value);

arrayInput.addEventListener("input", () => {
  syncSearchTargetToArray();
});

searchInput.addEventListener("input", () => {
  searchInput.dataset.autoTarget = "false";
});

selectBtn.addEventListener("change", () => {
  if (isRunning) {return;}
  const algo_name = selectBtn.value;
  updateSearchControls(algo_name);
  const algo_code = globalThis.read_algo(algo_name);
  const full_algo_string = buildLoadedAlgorithmCode(algo_name, algo_code);
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: full_algo_string,
    },
  });
  localStorage.setItem("savedCode", full_algo_string);
  logOutput(`Loaded ${selectBtn.options[selectBtn.selectedIndex].text}.`, false);
});

searchPresetBtn.addEventListener("click", () => {
  if (isRunning || !isSearchAlgorithm(selectBtn.value)) {return;}
  try {
    setSearchTargetFromArray();
  } catch (err) {
    logOutput(err.message, true);
  }
});

playBtn.addEventListener("click", async () => {
  if (isRunning) {return;}

  const code = editor.state.doc.toString();
  localStorage.setItem("savedCode", code);

  if (code.trim() && !/async\s+def\s+(algorithm|sort)\s*\(/.test(code)) {
    logOutput(
      "Custom code must define async def algorithm(arr) (or async def sort(arr)) and use await arr.step(...) so Pause/Stop can interrupt.",
      true
    );
    return;
  }

  try {
    currentArray = parseArrayInput(arrayInput.value);
  } catch (err) {
    logOutput(err.message, true);
    return;
  }

  try {
    window.searchTarget = parseSearchTarget(searchInput.value);
  } catch (err) {
    logOutput(err.message, true);
    return;
  }

  window.updateDisplay({ array: currentArray, highlighted_indices: {}, side_elements: [] });

  if (typeof window.triggerStepper !== "function") {
    logOutput("Python runtime is still loading. Try again in a moment.", true);
    return;
  }

  setRunState({ running: true, paused: false });
  logOutput("Running algorithm...");
  try {
    await window.triggerStepper(currentArray, code, SAFETY_MAX_SECONDS, SAFETY_MAX_STEPS);
    logOutput("Run completed successfully.");
  } finally {
    setRunState({ running: false, paused: false });
  }
});

pauseBtn.addEventListener("click", () => {
  if (!isRunning || isPaused) {return;}
  if (typeof window.pauseStepper === "function") {
    window.pauseStepper();
    setRunState({ running: true, paused: true });
    logOutput("Run paused.");
  }
});

resumeBtn.addEventListener("click", () => {
  if (!isRunning || !isPaused) {return;}
  if (typeof window.resumeStepper === "function") {
    window.resumeStepper();
    setRunState({ running: true, paused: false });
    logOutput("Running algorithm...");
  }
});

stopBtn.addEventListener("click", () => {
  if (!isRunning) {return;}
  if (typeof window.stopStepper === "function") {
    window.stopStepper();
    setRunState({ running: true, paused: false });
    logOutput("Stopping run...");
  }
});

function syncControlButtons() {
  playBtn.disabled = isRunning;
  selectBtn.disabled = isRunning;
  pauseBtn.disabled = !isRunning || isPaused;
  resumeBtn.disabled = !isRunning || !isPaused;
  stopBtn.disabled = !isRunning;
}

function setRunState({ running, paused }) {
  isRunning = running;
  isPaused = paused;
  syncControlButtons();
}

syncControlButtons();

export { parseArrayInput };