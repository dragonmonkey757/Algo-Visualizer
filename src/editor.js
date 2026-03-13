import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import './style.css'

const state = EditorState.create({
  doc: '',
  extensions: [
    lineNumbers(),
    python(),
    oneDark,
  ]
})
new EditorView({
  state, 
  parent:document.getElementById('editor')
})