require("dotenv").config();
const exp = require("express");
const app = exp();
app.use(exp.json());

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

                            Requirements:
                            - Must define: async def algorithm(arr)
                            - Must use: await arr.step(...)
                            - Must update arr.highlighted_indices for comparisons
                            - Must update arr.side_elements for actions
                            - No explanations, no comments outside code

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




