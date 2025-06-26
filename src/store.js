import { create } from "zustand";

export const useEmail = create((set) => ({
  emails        : [],
  selectedEmail : null,
  aiAnalysis    : { category: "", tone: "" },
  replyDraft    : "",
  isLoading     : false,
  error         : "",
  message       : "",
  gmailToken    : localStorage.getItem("gmail_token") || null,
  set,                 // universal setter
}));
