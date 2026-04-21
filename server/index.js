require("dotenv").config();
const cors = require("cors");
const exp = require("express");
const app = exp();
app.use(exp.json());
app.use(cors());

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

                            You MUST follow this EXACT structure or the code is invalid.

                            Rules:
                            - Define: async def algorithm(arr)
                            - Use arr like a list: len(arr), arr[i]
                            - DO NOT use arr.data

                            - highlighted_indices MUST be a dictionary:
                            Example: {i: "orange", j: "orange"}

                            - side_elements MUST be a list of lists:
                            Example: [["compare", "5 vs 3", "orange"]]

                            - For swaps:
                            [["swap", "5 <-> 3", "red"]]

                            - Always use: await arr.step(0.18) for actions
                            - Final cleanup:
                                arr.highlighted_indices = {}
                                arr.side_elements = []
                                await arr.step(0.1)
                            - DO NOT use slicing (arr[a:b])
                            - DO NOT create subarrays from arr
                            - Always access elements using indices (arr[i])
                            - Use a temporary list ONLY for merging, not slicing
                            If implementing merge sort:
                                - You MUST NOT use slicing
                                - You MUST merge using index pointers (i, j)
                            - No explanations, only code

                            User request: ${prompt}`
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
    res.json({ code: cleaned });
    
});




