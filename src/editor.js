import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import './style.css'

const state = EditorState.create({
  doc: '',
  extensions: [
    basicSetup, 
    lineNumbers(),
    python(),
    oneDark,
  ]
})

const editor = new EditorView({
  state,
  parent: document.getElementById('editor')
});

const playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", () => {
  const code = editor.state.doc.toString();

  localStorage.setItem("savedCode", code);

  console.log("Saved Code:");
  console.log(code);

  alert("Code saved! Check console.");
});
