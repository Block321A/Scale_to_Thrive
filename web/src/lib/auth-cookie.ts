// Reads the signed-in person's name from the Supabase session cookie, with no library.
// Only used to decide what the header shows; real access is always checked on the server.
export function readSessionName(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (typeof document === "undefined" || !url) return "";
  try {
    const base = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
    const jar: Record<string, string> = {};
    for (const c of document.cookie.split("; ")) {
      const i = c.indexOf("=");
      if (i > 0) jar[c.slice(0, i)] = decodeURIComponent(c.slice(i + 1));
    }
    let raw = jar[base];
    if (!raw) { // long sessions are split into .0, .1, ...
      const parts: string[] = [];
      for (let i = 0; jar[`${base}.${i}`] !== undefined; i++) parts.push(jar[`${base}.${i}`]);
      raw = parts.join("");
    }
    if (!raw) return "";
    if (raw.startsWith("base64-")) {
      const b64 = raw.slice(7).replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=")), (ch) => ch.charCodeAt(0));
      raw = new TextDecoder().decode(bytes);
    }
    const user = JSON.parse(raw)?.user;
    return user ? (user.user_metadata?.full_name || user.email || "My account") : "";
  } catch {
    return "";
  }
}
