const data = Array.from({length: 20}, () => Math.floor(Math.random() * 100));

const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data.map((_, i) => i),
        datasets: [{
            label: 'Values',
            data: [...data],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
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


// colorMap is an Object of arrow functions that returns rgba strings
// 'red' is a key, () => '' is thr arrow function
// 2 ways to access
// colorMap['red'](0.5) will return 'rgba(255,0,0,0.5)'
// colorMap.red(0.5) will also return 'rgba(255,0,0,0.5)'
// a is parameter to the array representing the alpha value
const colorMap = {
        'red': (a=1) => `rgba(255,0,0,${a})`,
        'orange': (a=1) => `rgba(255,165,0,${a})`,
        'purple': (a=1) => `rgba(128,0,128,${a})`,
        'blue': (a=1) => `rgba(54,162,235,${a})`,
};

function getColor(colorKey, opacity, index = null) {
    if (!colorKey || typeof colorMap[colorKey] !== 'function') {
        if (index !== null) {
            console.warn(`Invalid color key for index ${index}:`, colorKey);
        }
        return colorMap['blue'](opacity);
    }
    return colorMap[colorKey](opacity);
}

function updateMainChart(array, highlightedIndices) {
    chart.data.datasets[0].data = [...array];
        chart.data.datasets[0].backgroundColor = array.map((_, i) =>
            getColor(highlightedIndices[i], 0.7, i)
        );

        chart.data.datasets[0].borderColor = array.map((_, i) =>
            getColor(highlightedIndices[i], 1, i)
        );
    
}

// This function adds the side elements by accessing the sideElementsContainer and rewrites the sections's HTML with new HTML strings
function updateSideElements(sideElements) {
    const container = document.getElementById('sideElementsContainer');
    if (!container) return;
    container.innerHTML = sideElements
        .map(item => {
            const [name, value, color] = item;
            const bg = getColor(color, 0.7);
            const border = getColor(color, 1);
            return `<div class="side-element" style="background:${bg};border:1px solid ${border};">${name}: ${value}</div>`;
        })
        .join('');
}

async function updateDisplay(data) {
    const array = data.array;
    const highlightedIndices = data.highlighted_indices;
    const sideElements = data.side_elements;

    updateMainChart(array, highlightedIndices);
    updateSideElements(sideElements);

    chart.update();
    console.log("Updated display with array:", array, "highlighted:", highlightedIndices, "side:", sideElements);
}
globalThis.updateDisplay = updateDisplay;

document.getElementById("startBtn").addEventListener("click", startSort);
function startSort() {
    let arr = [...data];
    console.log("Triggering stepper with array:", arr);
    window.triggerStepper(arr); 
}