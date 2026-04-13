// Code written originally, copilot separated into own file

import { editor } from './editor.js'

const playBtn = document.getElementById("playBtn");
const templateBtn = document.getElementById("templateBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const arrayInput = document.getElementById("arrayInput");
const output = document.getElementById("output");

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

templateBtn.addEventListener("click", () => {
  if (isRunning) {return;}
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: STARTER_CODE,
    },
  });
  localStorage.setItem("savedCode", STARTER_CODE);
  logOutput("Loaded async template. Press Run to execute.", false);
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
  templateBtn.disabled = isRunning;
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
