// ─────────────────────────────────────────────
// FILE: src/ui/Composer.jsx
// Sends prompt via GET query-string  …/generate?prompt=
// ─────────────────────────────────────────────
import React, { useEffect } from "react";
import { useEmail } from "../store";

/* ── prompt builders ────────────────────── */
const buildAnalysisPrompt = (e) => `
Analyse the email. Return JSON {"category":"…","tone":"…"}.

Subject: ${e.subject}

${e.body}`.trim();

const buildReplyPrompt = (e, a) => `
Draft a concise reply.

Intent : "${a.category}"
Tone   : "${a.tone}"
Start with "Hi ${e.sender.split("<")[0].trim()},"

Subject: ${e.subject}

${e.body}`.trim();

/* ── call Gemini via GET ─────────────────── */
const callGemini = async (prompt) => {
  const url =
    "/.netlify/functions/generate?prompt=" +
    encodeURIComponent(prompt.slice(0, 7800)); // stay under URL limit
  const res = await fetch(url);
  return res.json();
};

/* ── main component ──────────────────────── */
function Composer() {
  const {
    selectedEmail,
    aiAnalysis,
    replyDraft,
    isLoading,
    error,
    message,
    set
  } = useEmail();

  useEffect(() => {
    (async () => {
      if (!selectedEmail) return;
      set({ isLoading: true, error: "", replyDraft: "", aiAnalysis: { category:"", tone:"" } });

      try {
        /* 1️⃣ analysis */
        const analysisRes = await callGemini(buildAnalysisPrompt(selectedEmail));
        const analysisText =
          analysisRes?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(analysisText);
        set({ aiAnalysis: parsed });

        /* 2️⃣ reply */
        const replyRes = await callGemini(buildReplyPrompt(selectedEmail, parsed));
        const draftText =
          replyRes?.candidates?.[0]?.content?.parts?.[0]?.text || "(No text returned)";
        set({ replyDraft: draftText });
      } catch (err) {
        console.error(err);
        set({ error: "AI error — try again." });
      } finally {
        set({ isLoading:false });
      }
    })();
  }, [selectedEmail]);

  const send = () => {
    console.log(`Simulated send:\n${replyDraft}`);
    set({ message:'Reply "sent" (simulated)!', selectedEmail:null });
    setTimeout(() => set({ message:"" }), 3000);
  };

  if (!selectedEmail) return null;

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center mb-4">
        <p className="font-semibold text-indigo-700 mr-4">AI Analysis:</p>
        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 mr-2">
          Category: {aiAnalysis.category || "…"}
        </span>
        <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
          Tone: {aiAnalysis.tone || "…"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-lg text-indigo-600">Generating…</p>
        </div>
      ) : (
        <textarea
          className="w-full p-4 border rounded min-h-[150px] resize-y focus:ring-indigo-500"
          value={replyDraft}
          onChange={(e) => set({ replyDraft:e.target.value })}
        />
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mt-4">
          {message}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={send}
          disabled={isLoading || !replyDraft}
          className={`px-6 py-3 rounded-full text-lg font-semibold shadow-md ${
            isLoading || !replyDraft
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isLoading ? "Working…" : "Copy / Send"}
        </button>
      </div>
    </>
  );
}

export default Composer;
