require("dotenv").config();
const cors = require("cors");
const exp = require("express");
const app = exp();
app.use(exp.json());
app.use(cors());

function validateGeneratedCode(code) {
  if (!code){ return "No code returned"};

  if (!/async\s+def\s+algorithm\s*\(/.test(code)) {
    return "Missing 'async def algorithm(arr)'";
  }

  if (!code.includes("await arr.step")) {
    return "Missing 'await arr.step(...)'";
  }

  if (!code.includes("arr.highlighted_indices")) {
    return "Missing highlighted_indices updates";
  }

  if (!code.includes("arr.side_elements")) {
    return "Missing side_elements updates";
  }

  const forbidden = [
    "arr.data",
    ".copy(",
    "slice(",
    "[:",
    ":]",
  ];

  for (const bad of forbidden) {
    if (code.includes(bad)) {
      return `Forbidden pattern used: ${bad}`;
    }
  }

  return null;
}

function buildPrompt(userPrompt) {
  return `Write ONLY Python code. No explanations, no comments outside the code.

You are generating code for an algorithm visualizer that animates sorting step-by-step.

CORE REQUIREMENTS
- Define: async def algorithm(arr)
- Sort the array in-place.
- "arr" behaves like a Python list: len(arr), arr[i], and swapping via arr[i], arr[j] = arr[j], arr[i]
- Never use arr.data, .copy(), or any slicing (arr[a:b], arr[:b], arr[a:])

VISUALIZATION SYSTEM (CRITICAL)
The UI only updates when you call: await arr.step(delay)
All highlight/side_element updates must happen BEFORE that call.

VISUAL RULES
1. Comparison:
   arr.highlighted_indices = {i: "orange", j: "orange"}
   arr.side_elements = [["compare", f"{arr[i]} vs {arr[j]}", "orange"]]
   await arr.step(0.18)

2. Swap:
   arr[i], arr[j] = arr[j], arr[i]
   arr.highlighted_indices = {i: "red", j: "red"}
   arr.side_elements = [["swap", f"{arr[i]} <-> {arr[j]}", "red"]]
   await arr.step(0.18)

3. Write (e.g. merge sort):
   arr[k] = value
   arr.highlighted_indices = {k: "purple"}
   arr.side_elements = [["write", f"{value} -> index {k}", "purple"]]
   await arr.step(0.18)

CONSTRAINTS
- Update only a few elements at a time; never bulk-overwrite the array.
- Never skip a comparison or swap step.
- No subarrays unless absolutely necessary; no slicing, no .copy().

RECURSIVE SORTS (merge sort, quick sort)
- Still update visuals step-by-step with await arr.step(...) inside loops.
- Merge sort: use index pointers (i, j, k), a temp array only for merging,
  and copy values back one at a time with arr[k] = value, calling
  await arr.step(0.18) after each write.
- Quick sort: highlight pivot comparisons, swap step-by-step, show the
  partition process clearly.

FINAL CLEANUP (always end with this)
arr.highlighted_indices = {}
arr.side_elements = []
await arr.step(0.1)

EXAMPLE (Bubble Sort)
async def algorithm(arr):
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

TASK
Generate a correct implementation. Double-check it will run before returning it.

${userPrompt}`;
}

async function callGemini(promptText, maxRetries = 3) {
  let lastErrText = "";
  let lastStatus = 500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    if (response.ok) {
      return { ok: true, data: await response.json() };
    }

    lastStatus = response.status;
    lastErrText = await response.text();

    const retryable = response.status === 503 || response.status === 429;
    if (!retryable || attempt === maxRetries) {
      return { ok: false, status: lastStatus, errText: lastErrText };
    }

    const delayMs = 1000 * Math.pow(2, attempt);
    console.warn(
      `Gemini returned ${response.status}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return { ok: false, status: lastStatus, errText: lastErrText };
}

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

app.post("/generate", async function (req, res) {
  const prompt = req.body.prompt;
  const fullPrompt = buildPrompt(prompt);

  const result = await callGemini(fullPrompt);

  if (!result.ok) {
    console.error("Gemini API error:", result.errText);
    return res.status(result.status).json({
      error: "AI request failed",
      details: result.errText
    });
  }

  const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
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