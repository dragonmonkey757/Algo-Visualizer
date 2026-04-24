import Chart from "chart.js/auto";
import { parseArrayInput } from "./buttons";

const data = parseArrayInput("12, 4, 9, 1, 18, 6, 3");

const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: data.map((_, i) => i),
        datasets: [{
            label: "Values",
            data: [...data],
            backgroundColor: data.map(() => "rgba(54,162,235,0.7)"),
            borderColor: data.map(() => "rgba(54,162,235,1)"),
            borderWidth: 1
        }]
    },
    options: {
        animation: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


const colorMap = {
    red: "255,0,0",
    orange: "255,165,0",
    purple: "128,0,128",
    blue: "54,162,235",
    green: "75,192,75",
    yellow: "255,255,0",
    pink: "255,192,203",
    cyan: "0,255,255",
    magenta: "255,0,255",
    gray: "128,128,128"
};

function getColor(colorKey, opacity = 1) {
    const rgb = colorMap[colorKey] || colorMap.blue;
    return `rgba(${rgb},${opacity})`;
}

function updateMainChart(array, highlightedIndices = {}) {
    chart.data.labels = array.map((_, i) => i);
    chart.data.datasets[0].data = [...array];
    chart.data.datasets[0].backgroundColor = array.map((_, i) =>
        getColor(highlightedIndices[i], 0.7)
    );

    chart.data.datasets[0].borderColor = array.map((_, i) =>
        getColor(highlightedIndices[i], 1)
    );
}

// This function adds the side elements by accessing the sideElementsContainer and rewrites the sections's HTML with new HTML strings
function updateSideElements(sideElements = []) {
    const container = document.getElementById("sideElementsContainer");
    if (!container) {return;}
    container.innerHTML = sideElements
        .map((item) => {
            const [name, value, color] = item;
            const bg = getColor(color, 0.7);
            const border = getColor(color, 1);
            return `<div class="side-element" style="background:${bg};border:1px solid ${border};">${name}: ${value}</div>`;
        })
        .join("");
}

async function updateDisplay(data) {
    const array = data.array || [];
    const highlightedIndices = data.highlighted_indices || {};
    const sideElements = data.side_elements || [];

    updateMainChart(array, highlightedIndices);
    updateSideElements(sideElements);

    chart.update();
}

function reportRuntimeError(message) {
    console.error(`Runtime error: ${message}`);
}
globalThis.reportRuntimeError = reportRuntimeError;
globalThis.updateDisplay = updateDisplay;