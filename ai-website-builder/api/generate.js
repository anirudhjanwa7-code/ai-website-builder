// Vercel serverless function: /api/generate
// API key kabhi browser me nahi jati, sirf server ke environment variable me rehti hai.

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_PROMPT = 2000;
const MAX_HTML = 120000;

// Simple abuse protection: ek IP se 1 minute me max 6 requests (serverless me best-effort).
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 6;
}

const SYSTEM = `You are an expert web developer. The user describes a website or web app.
Return ONE complete, self-contained HTML document (<!doctype html> to </html>) with all CSS in <style> and all JavaScript in <script>.
Rules:
- No external build tools. You may load libraries only from cdnjs.cloudflare.com or cdn.jsdelivr.net.
- Responsive (works on mobile), modern and clean design, accessible, real working interactions (not placeholders) where the prompt implies functionality.
- Use the same language as the user's prompt for visible text unless they ask otherwise.
- Use placeholder images only from https://picsum.photos or inline SVG/CSS gradients.
- If an existing HTML is provided, apply the user's requested change to it and return the full updated document.
- Output ONLY the HTML. No explanations, no markdown fences.`;

function clean(text) {
  return text
    .replace(/^\s*```(?:html)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Sirf POST allowed hai." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Server par GEMINI_API_KEY set nahi hai." });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ error: "Bahut zyada requests. Ek minute baad try karo." });

  const { prompt, currentHtml } = req.body || {};
  if (typeof prompt !== "string" || prompt.trim().length < 5) {
    return res.status(400).json({ error: "Prompt bahut chhota hai." });
  }
  if (prompt.length > MAX_PROMPT) {
    return res.status(400).json({ error: `Prompt ${MAX_PROMPT} characters se chhota rakho.` });
  }

  let userText = prompt.trim();
  if (typeof currentHtml === "string" && currentHtml.length > 0) {
    if (currentHtml.length > MAX_HTML) {
      return res.status(400).json({ error: "Current website bahut badi hai, naya shuru karo." });
    }
    userText = `Existing HTML:\n${currentHtml}\n\nRequested change:\n${userText}`;
  }

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: userText }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 16000 }
        })
      }
    );
    const data = await r.json();
    if (!r.ok) {
      const msg = data?.error?.message || "AI service error";
      return res.status(502).json({ error: msg });
    }
    const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
    const html = clean(text);
    if (!/<html|<!doctype/i.test(html)) {
      return res.status(502).json({ error: "AI ne sahi HTML nahi diya, dobara try karo." });
    }
    return res.status(200).json({ html });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}
