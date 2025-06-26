const callGemini = async (prompt) => {
  return fetch("/.netlify/functions/generate", {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ prompt })   //  ← sends { prompt: "..." }
  })
  .then(r => r.json())
  .then(j => { console.log("GeminiFromFunc", j); return j; });
};
