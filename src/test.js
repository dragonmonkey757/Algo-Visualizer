const data = Array.from({length: 20}, () => Math.floor(Math.random() * 100));

const ctx = document.getElementById('chart').getContext('2d');

const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data.map((_, i) => i),
        datasets: [{
            label: 'Values',
            data: [...data],
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bubbleSort(arr) {
    const n = arr.length;

    for (let i = 0; i < n; i++) {

        for (let j = 0; j < n - i - 1; j++) {

            if (arr[j] > arr[j + 1]) {

                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

                chart.data.datasets[0].data = [...arr];
                chart.update();

                await sleep(100);
            }
        }
    }
}

document.getElementById("startBtn").addEventListener("click", startSort);

function startSort() {
    bubbleSort(data);
}