// ─────────────────────────────────────────────
// FILE: netlify/functions/generate.js
// Works with Netlify’s “handler” style (no res.status)
// ─────────────────────────────────────────────
export default async (event /*, context */) => {
  try {
    /* 1️⃣  read incoming prompt */
    const { prompt } = JSON.parse(event.body || "{}");
    const key = process.env.GEMINI_API_KEY;

    if (!key)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY" })
      };
    if (!prompt)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt" })
      };

    /* 2️⃣  call Gemini */
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      key;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS",   threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT",  threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
      ]
    };

    const g = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await g.json();

    /* 3️⃣  little log for debugging */
    console.log("Gemini response:", JSON.stringify(data).slice(0, 400));

    /* 4️⃣  return to browser */
    return {
      statusCode: g.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
