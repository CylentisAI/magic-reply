// ─────────────────────────────────────────────
// FILE: src/ui/Composer.jsx
// PASTE THE WHOLE FILE — NO CHANGES NEEDED
// ─────────────────────────────────────────────
import React, { useEffect } from "react";
import { useEmail } from "../store";

/* ── prompt builders ────────────────────── */
const buildAnalysisPrompt = (email) => `
Analyse the following email. Return JSON exactly like:
{"category":"<primary intent>","tone":"<suggested reply tone>"}

Subject: ${email.subject}

${email.body}`.trim();

const buildReplyPrompt = (email, analysis) => `
Draft a concise reply to the email below.

Intent  : "${analysis.category}"
Tone    : "${analysis.tone}"
Greeting: Start with "Hi ${email.sender.split("<")[0].trim()},"

Email:
Subject: ${email.subject}

${email.body}`.trim();

/* ── helper: call Netlify function ───────── */
const callGemini = async (prompt) => {
  const res = await fetch("/.netlify/functions/generate", {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ prompt })          // ONLY the prompt string
  });
  return res.json();
};

/* ── main component ──────────────────────── */
export default function Composer() {
  const {
    selectedEmail,
    aiAnalysis,
    replyDraft,
    isLoading,
    error,
    message,
    set
  } = useEmail();

  /* run AI whenever a new email is selected */
  useEffect(() => {
    (async () => {
      if (!selectedEmail) return;
      set({
        isLoading: true,
        error: "",
        replyDraft: "",
        aiAnalysis: { category: "", tone: "" }
      });

      try {
        /* 1️⃣  analysis */
        const analysisRes = await callGemini(buildAnalysisPrompt(selectedEmail));
        const analysisText =
          analysisRes?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const analysisObj = JSON.parse(analysisText);
        set({ aiAnalysis: analysisObj });

        /* 2️⃣  reply */
        const replyRes = await callGemini(
          buildReplyPrompt(selectedEmail, analysisObj)
        );
        const draftText =
          replyRes?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "(No text returned)";
        set({ replyDraft: draftText });
      } catch (err) {
        console.error(err);
        set({ error: "AI error — try again." });
      } finally {
        set({ isLoading: false });
      }
    })();
  }, [selectedEmail]);

  /* simulate “send” */
  const send = () => {
    console.log(`Simulated send to ${selectedEmail.sender}:\n${replyDraft}`);
    set({ message: 'Reply "sent" (simulated)!', selectedEmail: null });
    setTimeout(() => set({ message: "" }), 3000);
  };

  /* no email selected → nothing to show */
  if (!selectedEmail) return null;

  /* ── UI ────────────────────────────────── */
  return (
    <>
      {/* error banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* analysis chips */}
      <div className="flex items-center mb-4">
        <p className="font-semibold text-indigo-700 mr-4">AI Analysis:</p>
        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 mr-2">
          Category: {aiAnalysis.category || "…"}
        </span>
        <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
          Tone: {aiAnalysis.tone || "…"}
        </span>
      </div>

      {/* draft area */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-lg text-indigo-600">Generating…</p>
        </div>
      ) : (
        <textarea
          className="w-full p-4 border rounded min-h-[150px] resize-y focus:ring-indigo-500"
          value={replyDraft}
          onChange={(e) => set({ replyDraft: e.target.value })}
        />
      )}

      {/* success banner */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          {message}
        </div>
      )}

      {/* send button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={send}
          disabled={isLoading || !replyDraft}
          className={`px-6 py-3 rounded-full text-lg font-semibold shadow-md
            ${
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
