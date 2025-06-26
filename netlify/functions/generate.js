
import fetch from "node-fetch";

export default async (req, res) => {
  try {
    const { prompt } = JSON.parse(req.body || "{}");      // changed key to "prompt"
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
      ]
    };

    const g = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await g.json();

    /* --- NEW: log raw response so we can debug in Netlify dashboard --- */
    console.log("Gemini response:", JSON.stringify(data).slice(0, 500));

    res.status(g.status).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
