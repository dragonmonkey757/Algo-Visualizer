import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import "./style.css";

const STARTER_CODE = `async def algorithm(arr):
    await INSERT_ALGO_HERE(arr)
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

export { STARTER_CODE, editor };





