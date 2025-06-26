import React from "react";
import { useEmail } from "../store";

export default function Viewer() {
  const { selectedEmail } = useEmail();

  if (!selectedEmail)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p className="text-xl">Select an email to see details.</p>
      </div>
    );

  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <h3 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h3>
      <p className="text-md text-gray-600 mb-1">
        From: <span className="font-medium">{selectedEmail.sender}</span>
      </p>
      <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200
                      text-sm max-h-40 overflow-y-auto shadow-inner">
        <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
      </div>
    </div>
  );
}
