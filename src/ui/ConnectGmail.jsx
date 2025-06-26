import React from "react";
import { useEmail } from "../store";

export default function ConnectGmail() {
  const { set, error } = useEmail();

  const connect = () => {
    if (!import.meta.env.VITE_GCP_CLIENT_ID) {
      set({ error: "Missing VITE_GCP_CLIENT_ID env var." });
      return;
    }
    if (typeof google === "undefined") {
      set({ error: "Google script not loaded. Refresh the page." });
      return;
    }
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GCP_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
      callback: (resp) => {
        localStorage.setItem("gmail_token", resp.access_token);
        set({ gmailToken: resp.access_token });
      }
    });
    tokenClient.requestAccessToken();
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md text-sm">
          {error}
        </div>
      )}
      <button
        onClick={connect}
        className="px-6 py-3 rounded-full text-lg font-semibold bg-red-500 text-white
                   hover:bg-red-600 shadow-md"
      >
        Connect your Gmail
      </button>
      <button
        onClick={() => set({ gmailToken: "demo" })}
        className="mt-4 text-sm underline text-gray-600 hover:text-gray-800"
      >
        Skip & use demo inbox
      </button>
    </div>
  );
}
