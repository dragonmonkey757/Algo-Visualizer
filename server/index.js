require("dotenv").config();
const cors = require("cors");
const exp = require("express");
const app = exp();
app.use(exp.json());
app.use(cors());

function validateGeneratedCode(code) {
  if (!code) return "No code returned";

  // Must define algorithm function
  if (!/async\s+def\s+algorithm\s*\(/.test(code)) {
    return "Missing 'async def algorithm(arr)'";
  }

  // Must use step
  if (!code.includes("await arr.step")) {
    return "Missing 'await arr.step(...)'";
  }

  // Must use highlighting
  if (!code.includes("arr.highlighted_indices")) {
    return "Missing highlighted_indices updates";
  }

  // Must use side elements
  if (!code.includes("arr.side_elements")) {
    return "Missing side_elements updates";
  }

  // Forbidden patterns
  const forbidden = [
    "arr.data",
    ".copy(",
    "slice(",
    "[:",     // catches slicing like arr[1:]
    ":]",     // catches slicing like arr[:5]
  ];

  for (const bad of forbidden) {
    if (code.includes(bad)) {
      return `Forbidden pattern used: ${bad}`;
    }
  }

  return null; // valid
}

app.listen(3001, () => 
    {
        console.log("Server running on port 3001");
});

app.post('/generate', async function(req, res) 
{
    const prompt = req.body.prompt;
    console.log(prompt);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {    
    method: "POST",
    headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {  text: `Write ONLY Python code.

                                    You are generating code for an algorithm visualizer that animates sorting step-by-step.

                                    ========================
                                    CORE REQUIREMENTS
                                    ========================
                                    - You MUST define: async def algorithm(arr)
                                    - The function MUST sort the array in-place.
                                    - "arr" behaves exactly like a Python list:
                                        - len(arr)
                                        - arr[i]
                                        - swapping: arr[i], arr[j] = arr[j], arr[i]
                                    - DO NOT use arr.data

                                    ========================
                                    VISUALIZATION SYSTEM (CRITICAL)
                                    ========================
                                    The UI updates ONLY when:
                                        await arr.step(delay)

                                    RULE:
                                    - ALL updates MUST happen BEFORE calling await arr.step()

                                    ========================
                                    VISUAL RULES
                                    ========================

                                    1. COMPARISON:
                                    arr.highlighted_indices = {i: "orange", j: "orange"}
                                    arr.side_elements = [["compare", f"{arr[i]} vs {arr[j]}", "orange"]]
                                    await arr.step(0.18)

                                    2. SWAP:
                                    arr[i], arr[j] = arr[j], arr[i]
                                    arr.highlighted_indices = {i: "red", j: "red"}
                                    arr.side_elements = [["swap", f"{arr[i]} <-> {arr[j]}", "red"]]
                                    await arr.step(0.18)

                                    3. WRITE (for algorithms like merge sort):
                                    arr[k] = value
                                    arr.highlighted_indices = {k: "purple"}
                                    arr.side_elements = [["write", f"{value} -> index {k}", "purple"]]
                                    await arr.step(0.18)

                                    4. Here is the chart.js code for reference:
                                    import Chart from "chart.js/auto";
                                    
                                    const data = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100));
                                    
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
                                    };
                                    
                                    function getColor(colorKey, opacity = 1) {
                                        const rgb = colorMap[colorKey] || colorMap.blue;
                                        return rgba(\${rgb},\${opacity});
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
                                                return <div class="side-element" style="background:\${bg};border:1px solid \${border};">\${name}: \${value}</div>;
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
                                        console.error(Runtime error: \${message});
                                    }
                                    globalThis.reportRuntimeError = reportRuntimeError;
                                    globalThis.updateDisplay = updateDisplay;

                                    ========================
                                    IMPORTANT CONSTRAINTS
                                    ========================
                                    - Modify ONLY a few elements at a time (no bulk overwrites)
                                    - DO NOT replace the entire array at once
                                    - DO NOT skip steps (every comparison must be visualized)
                                    - DO NOT use slicing: arr[a:b]
                                    - DO NOT use arr.copy()
                                    - DO NOT create subarrays unless absolutely necessary

                                    ========================
                                    RECURSIVE / COMPLEX SORTS
                                    ========================
                                    If using recursion (merge sort, quick sort):

                                    - You MUST still:
                                        - update visuals step-by-step
                                        - use await arr.step(...) inside loops

                                    MERGE SORT RULES:
                                    - DO NOT use slicing
                                    - Use index pointers (i, j, k)
                                    - Use a temporary array ONLY for merging
                                    - Copy values back ONE AT A TIME using arr[k] = value
                                    - After EACH write, call await arr.step(0.18)

                                    QUICK SORT RULES:
                                    - Highlight pivot comparisons
                                    - Swap elements step-by-step
                                    - Show partition process clearly

                                    ========================
                                    FINAL CLEANUP
                                    ========================
                                    arr.highlighted_indices = {}
                                    arr.side_elements = []
                                    await arr.step(0.1)

                                    ========================
                                    OUTPUT RULES
                                    ========================
                                    - ONLY output Python code
                                    - NO explanations
                                    - NO comments outside code

                                    ========================
                                    EXAMPLE (Bubble Sort)
                                    ========================
                                    async def algorithm(arr):
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

                                    ========================
                                    TASK
                                    ========================
                                    Generate a correct implementation for the code before generating make sure to check if it will
                                    run properly:

                                    ${prompt}`
                        }  
                    ]
                }
            ]
        })
    });
    if (!response.ok) 
        {
            const errText = await response.text();
            console.error("Gemini API error:", errText);
            return res.status(500).json({ error: "AI request failed" });
        }


    
    const data = await response.json();
    console.log(data);

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text
    .replace(/```python/g, "")
    .replace(/```/g, "")
    .trim();
    const error = validateGeneratedCode(cleaned);

    if (error) {
    console.error("Validation failed:", error);

    return res.status(400).json({
        error: "Invalid AI-generated code",
        details: error
    });
    }


    res.json({ code: cleaned });
    
});




