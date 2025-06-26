import React from "react";
import { useEmail } from "../store";
import ConnectGmail from "./ConnectGmail";
import Inbox from "./Inbox";
import Viewer from "./Viewer";
import Composer from "./Composer";

export default function AppShell() {
  const { gmailToken } = useEmail();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100
                    font-sans text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row">
      {!gmailToken ? (
        <div className="w-full bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center min-h-[500px]">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">Magic-Reply</h1>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            Connect Gmail or explore the demo inbox, then let AI draft your replies.
          </p>
          <ConnectGmail />
        </div>
      ) : (
        <>
          <Inbox />
          <div className="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <Viewer />
            <Composer />
          </div>
        </>
      )}
    </div>
  );
}
