
import fetch from "node-fetch";

export default async (req, res) => {
  try {
    const { payload } = JSON.parse(req.body || "{}");
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const g   = await fetch(url, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload)
    });

    const data = await g.json();
    return res.status(g.status).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
