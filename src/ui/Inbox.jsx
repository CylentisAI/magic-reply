import React, { useEffect } from "react";
import clsx from "clsx";
import { useEmail } from "../store";
import { dummyEmails } from "../data/dummyEmails";
import { fetchGmailEmails } from "../services/gmailApi";

export default function Inbox() {
  const { emails, selectedEmail, gmailToken, set } = useEmail();

  /* load inbox */
  useEffect(() => {
    (async () => {
      set({ isLoading: true, error: "" });
      try {
        if (gmailToken && gmailToken !== "demo") {
          set({ emails: await fetchGmailEmails(gmailToken) });
        } else {
          set({ emails: dummyEmails });
        }
      } catch {
        set({ error: "Failed to load inbox. Showing demo data.", emails: dummyEmails });
      } finally {
        set({ isLoading: false });
      }
    })();
  }, [gmailToken]);

  const select = (e) => set({
    selectedEmail: e,
    aiAnalysis: { category: "", tone: "" },
    replyDraft: "",
    message: "",
    error: ""
  });

  return (
    <div className="w-full md:w-1/3 bg-white rounded-xl shadow-lg p-4 mb-6 md:mb-0 md:mr-6
                    overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-700">
          {gmailToken === "demo" ? "Demo Inbox" : "Gmail Inbox"}
        </h2>
        <button
          onClick={() => { localStorage.removeItem("gmail_token"); set({ gmailToken: null, emails: [] }); }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {gmailToken === "demo" ? "Exit Demo" : "Disconnect"}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        {emails.map((e) => (
          <div key={e.id}
               onClick={() => select(e)}
               className={clsx(
                 "p-3 mb-2 rounded-lg cursor-pointer transition",
                 selectedEmail?.id === e.id
                   ? "bg-indigo-100 border-l-4 border-indigo-500 shadow"
                   : "bg-gray-50 hover:bg-gray-100"
               )}>
            <p className="font-semibold">{e.sender.split("<")[0].trim()}</p>
            <p className="text-sm text-indigo-600 truncate">{e.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
