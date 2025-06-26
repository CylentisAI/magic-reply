// ─────────────────────────────────────────────
// FILE: netlify/functions/generate.js
// Accepts any body type and always returns a Response
// ─────────────────────────────────────────────
export default async (event) => {
  /* 1️⃣  get prompt safely */
  let prompt = "";
  try {
    if (typeof event.body === "string" && event.body.trim() !== "") {
      prompt = JSON.parse(event.body)?.prompt || "";
    } else if (event.body && typeof event.body === "object") {
      // Netlify sometimes passes already-parsed object
      prompt = event.body.prompt || "";
    }
  } catch {
    /* fall through — prompt stays "" */
  }

  const key = process.env.GEMINI_API_KEY;

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

  /* 2️⃣  call Gemini */
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

  const g = await fetch(url, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify(payload)
  });

  const gText = await g.text();
  console.log("GeminiRaw:", gText.slice(0, 300));

  return new Response(gText, {
    status : g.status,
    headers: { "content-type": "application/json" }
  });
};
