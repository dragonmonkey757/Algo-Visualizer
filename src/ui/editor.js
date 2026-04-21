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
    EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const code = update.state.doc.toString();
      localStorage.setItem("savedCode", code);
    }
  })
  ]
});

const editor = new EditorView({
  state,
  parent: document.getElementById("editor")
});

export { STARTER_CODE, editor }; // Copilot says this is needed in order for editor to be retrieved in other files





