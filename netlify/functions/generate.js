// ───────────────────────────────────────────
// Flex function: accepts {prompt:"…"}  OR  {payload:{…}}
// ───────────────────────────────────────────
export default async (event) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );

  /* ── parse body ───────────────────── */
  let bodyObj = {};
  try {
    bodyObj =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body || {};
  } catch {
    /* ignore parse errors */
  }

  let geminiRequest;

  /*** 1️⃣  New simple format: {prompt:"…"} ***/
  if (typeof bodyObj.prompt === "string" && bodyObj.prompt.trim() !== "") {
    geminiRequest = {
      contents: [{ role: "user", parts: [{ text: bodyObj.prompt }] }]
    };
  }

  /*** 2️⃣  Old format: {payload:{…}} ***/
  if (!geminiRequest && bodyObj.payload) {
    geminiRequest = bodyObj.payload; // already in Gemini shape
  }

  if (!geminiRequest)
    return new Response(
      JSON.stringify({ error: "Missing prompt or payload" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

  /* optional: loosen safety if desired */
  geminiRequest.safetySettings = [
    { category: "HARM_CATEGORY_DANGEROUS",   threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT",  threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
  ];

  /* ── call Gemini ───────────────────── */
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    key;

  const gRes  = await fetch(url, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify(geminiRequest)
  });

  const gText = await gRes.text();
  console.log("GeminiRaw:", gText.slice(0, 300)); // shows in Netlify Deploy logs

  return new Response(gText, {
    status : gRes.status,
    headers: { "content-type": "application/json" }
  });
};


