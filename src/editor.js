import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import Chart from 'chart.js/auto'
import './style.css'

const STARTER_CODE = `def algorithm(arr):
    # Sort by swapping adjacent values while emitting visual steps via ArrayMonitor.
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
`

const state = EditorState.create({
  doc: localStorage.getItem('savedCode') || STARTER_CODE,
  extensions: [
    basicSetup,
    lineNumbers(),
    python(),
    oneDark,
  ]
});

const editor = new EditorView({
  state,
  parent: document.getElementById('editor')
})

const playBtn = document.getElementById('playBtn')
const arrayInput = document.getElementById('arrayInput')
const output = document.getElementById('output')

const defaultArray = [12, 4, 9, 1, 18, 6, 3]
let currentArray = [...defaultArray]

const colorMap = {
  red: (a = 1) => `rgba(255,0,0,${a})`,
  orange: (a = 1) => `rgba(255,165,0,${a})`,
  purple: (a = 1) => `rgba(128,0,128,${a})`,
  blue: (a = 1) => `rgba(54,162,235,${a})`,
}

function getColor(colorKey, opacity, index = null) {
  if (!colorKey || typeof colorMap[colorKey] !== 'function') {
    if (index !== null) {
      console.warn(`Invalid color key for index ${index}:`, colorKey)
    }
    return colorMap.blue(opacity)
  }
  return colorMap[colorKey](opacity)
}

function parseArrayInput(value) {
  if (!value.trim()) return [...defaultArray]

  const parsed = value
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => !Number.isNaN(v))

  if (parsed.length === 0) {
    throw new Error('Enter a comma-separated list of numbers, like: 4, 2, 9, 1')
  }

  return parsed
}

function logOutput(message, isError = false) {
  output.textContent = message
  output.classList.toggle('error', isError)
}

const ctx = document.getElementById('chart').getContext('2d')
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: currentArray.map((_, i) => i),
    datasets: [{
      label: 'Values',
      data: [...currentArray],
      backgroundColor: currentArray.map(() => colorMap.blue(0.7)),
      borderColor: currentArray.map(() => colorMap.blue(1)),
      borderWidth: 1,
    }],
  },
  options: {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
})

function updateMainChart(array, highlightedIndices = {}) {
  chart.data.labels = array.map((_, i) => i)
  chart.data.datasets[0].data = [...array]
  chart.data.datasets[0].backgroundColor = array.map((_, i) =>
    getColor(highlightedIndices[i], 0.7, i)
  )
  chart.data.datasets[0].borderColor = array.map((_, i) =>
    getColor(highlightedIndices[i], 1, i)
  )
}

function updateSideElements(sideElements = []) {
  const container = document.getElementById('sideElementsContainer')
  if (!container) return
  container.innerHTML = sideElements
    .map((item) => {
      const [name, value, color] = item
      const bg = getColor(color, 0.7)
      const border = getColor(color, 1)
      return `<div class="side-element" style="background:${bg};border:1px solid ${border};">${name}: ${value}</div>`
    })
    .join('')
}

async function updateDisplay(data) {
  const array = data.array || []
  const highlightedIndices = data.highlighted_indices || {}
  const sideElements = data.side_elements || []

  updateMainChart(array, highlightedIndices)
  updateSideElements(sideElements)
  chart.update()
}

function reportRuntimeError(message) {
  logOutput(`Python error: ${message}`, true)
}

globalThis.updateDisplay = updateDisplay
globalThis.reportRuntimeError = reportRuntimeError

playBtn.addEventListener('click', async () => {
  const code = editor.state.doc.toString()
  localStorage.setItem('savedCode', code)

  try {
    currentArray = parseArrayInput(arrayInput.value)
  } catch (err) {
    logOutput(err.message, true)
    return
  }

  updateMainChart(currentArray)
  updateSideElements([])
  chart.update()

  if (typeof window.triggerStepper !== 'function') {
    logOutput('Python runtime is still loading. Try again in a moment.', true)
    return
  }

  logOutput('Running algorithm...')
  try {
    await window.triggerStepper(currentArray, code)
    logOutput('Run completed successfully.')
  } catch (err) {
    logOutput(`Run failed: ${err?.message || String(err)}`, true)
  }
})
