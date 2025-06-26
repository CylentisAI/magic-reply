/* Helper functions for Gmail fetch/send */

export async function fetchGmailEmails(token, max = 10) {
  const list = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${max}&labelIds=INBOX`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!list.ok) throw new Error("Gmail list fetch failed");
  const { messages = [] } = await list.json();

  const details = await Promise.all(
    messages.map(({ id }) =>
      fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((r) => r.json())
    )
  );

  return details.map((m) => {
    const h = m.payload.headers;
    const subj = h.find((x) => x.name === "Subject")?.value || "No subject";
    const from = h.find((x) => x.name === "From")?.value || "Unknown";
    let body = "";
    if (m.payload.body?.data) {
      body = atob(m.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"));
    } else if (m.payload.parts) {
      const part = m.payload.parts.find((p) => p.mimeType === "text/plain");
      if (part?.body?.data)
        body = atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
    }
    return { id: m.id, sender: from, subject: subj, body, threadId: m.threadId };
  });
}

export async function sendGmailReply(token, original, content) {
  const headers = [
    `To: ${original.sender}`,
    `Subject: Re: ${original.subject}`,
    `In-Reply-To: ${original.id}`,
    `References: ${original.threadId}`,
    "",
    content
  ].join("\r\n");
  const raw = btoa(headers).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw, threadId: original.threadId })
    }
  );
  if (!res.ok) throw new Error("Gmail send failed");
  return res.json();
}
