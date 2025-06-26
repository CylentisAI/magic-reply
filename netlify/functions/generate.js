// ─────────────────────────────────────────────
// FILE: netlify/functions/generate.js
// Accepts prompt 3 ways:
//   • POST body {prompt:"..."}
//   • POST body JSON string {"prompt":"..."}
//   • GET  /.netlify/functions/generate?prompt=...
// Works with Netlify Functions v4 (returns Response)
// ─────────────────────────────────────────────
export default async (event) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  /* ── 1️⃣  pull prompt from any place ── */
  let prompt = "";

  // a) query-string ?prompt=
  if (event.queryStringParameters?.prompt) {
    prompt = event.queryStringParameters.prompt;
  }

  // b) body as JSON object or string
  if (!prompt && event.body) {
    try {
      // body may be raw string or already-parsed object
      const bodyObj =
        typeof event.body === "string"
          ? JSON.parse(event.body)
          : event.body;
      if (typeof bodyObj.prompt === "string") prompt = bodyObj.prompt;
    } catch {
      // if not valid JSON, see if it contains "prompt":"..."
      const match = /"prompt"\s*:\s*"([^"]+)"/s.exec(event.body);
      if (match) prompt = JSON.parse(`"${match[1]}"`); // unescape
    }
  }

  if (!prompt) {
    return new Response(
      JSON.stringify({ error: "Missing prompt" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  /* ── 2️⃣  build Gemini payload ── */
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: [
      { category: "HARM_CATEGORY_DANGEROUS",   threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HARASSMENT",  threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
    ]
  };

  /* ── 3️⃣  call Gemini ── */
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    key;

  const g = await fetch(url, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify(payload)
  });

  const gText = await g.text();                   // raw pass-through
  console.log("GeminiRaw:", gText.slice(0, 300)); // appears in Deploy log

  return new Response(gText, {
    status : g.status,
    headers: { "content-type": "application/json" }
  });
};
