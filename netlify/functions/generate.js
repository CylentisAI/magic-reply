// ─────────────────────────────────────────────
// FILE: netlify/functions/generate.js
// Compatible with Netlify Functions v4 (ESM + Response)
// ─────────────────────────────────────────────
export default async (event) => {
  try {
    /* Netlify v4: event.body is already an object when
       "Content-Type: application/json" is sent */
    const bodyIn = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const prompt = bodyIn?.prompt;
    const key    = process.env.GEMINI_API_KEY;

    if (!key)
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );

    if (!prompt)
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );

    /* call Gemini */
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      key;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS",   threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT",  threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
      ]
    };

    const gRes  = await fetch(url, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload)
    });

    const gText = await gRes.text();           // pass through as-is
    console.log("Gemini:", gText.slice(0, 300));

    return new Response(gText, {
      status : gRes.status,
      headers: { "content-type": "application/json" }
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};
