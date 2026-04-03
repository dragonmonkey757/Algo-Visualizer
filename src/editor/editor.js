import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import "./style.css";

const STARTER_CODE = `async def algorithm(arr):
    # Use await arr.step(...) so pause/stop can interrupt and animation stays visible.
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            arr.highlighted_indices = {j: "orange", j + 1: "orange"}
            arr.side_elements = [["compare", f"{arr[j]} vs {arr[j + 1]}", "orange"]]
            await arr.step(0.18)

            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                arr.highlighted_indices = {j: "red", j + 1: "red"}
                arr.side_elements = [["swap", f"{arr[j]} <-> {arr[j + 1]}", "red"]]
                await arr.step(0.18)

    arr.highlighted_indices = {}
    arr.side_elements = []
    await arr.step(0.1)
`;

const state = EditorState.create({
  doc: localStorage.getItem("savedCode") || STARTER_CODE,
  extensions: [
    basicSetup,
    lineNumbers(),
    python(),
    oneDark,
  ]
});

const editor = new EditorView({
  state,
  parent: document.getElementById("editor")
});

const playBtn = document.getElementById("playBtn");
const templateBtn = document.getElementById("templateBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const arrayInput = document.getElementById("arrayInput");
const output = document.getElementById("output");

const defaultArray = [12, 4, 9, 1, 18, 6, 3];
let currentArray = [...defaultArray];
const SAFETY_MAX_STEPS = 2500;
const SAFETY_MAX_SECONDS = 12;

let isRunning = false;
let isPaused = false;

// Color helpers moved to stepper.js; use local defaults for initial render

function parseArrayInput(value) {
  if (!value.trim()) {return [...defaultArray];}

  const parsed = value
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v));

  if (parsed.length === 0) {
    throw new Error("Enter a comma-separated list of numbers, like: 4, 2, 9, 1");
  }

  return parsed;
}

function logOutput(message, isError = false) {
  output.textContent = message;
  output.classList.toggle("error", isError);
}

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

// The chart is initialized in stepper.js; call its updateDisplay when available.
function callSharedUpdate(data) {
  if (typeof window.updateDisplay === "function") {
    window.updateDisplay(data);
  } else {
    // Shared UI updater not available; skip chart update.
    console.warn("window.updateDisplay not available; skipping UI update");
  }
}

syncControlButtons();

// Initial render: ask the shared stepper to render the initial array if available.
callSharedUpdate({ array: currentArray, highlighted_indices: {}, side_elements: [] });

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

  callSharedUpdate({ array: currentArray, highlighted_indices: {}, side_elements: [] });

  if (typeof window.triggerStepper !== "function") {
    logOutput("Python runtime is still loading. Try again in a moment.", true);
    return;
  }

  setRunState({ running: true, paused: false });
  logOutput("Running algorithm...");
  try {
    await window.triggerStepper(currentArray, code, SAFETY_MAX_STEPS, SAFETY_MAX_SECONDS);
    logOutput("Run completed successfully.");
  } catch (err) {
    const message = err?.message || String(err);
    if (/stopped by user/i.test(message)) {
      logOutput("Run stopped by user.");
    } else {
      logOutput(`Run failed: ${message}`, true);
    }
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
