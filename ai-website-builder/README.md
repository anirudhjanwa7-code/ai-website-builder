# AI Website Builder

Prompt likho, AI poori website/app bana dega. Preview, code, download sab milta hai.

## Files
- `index.html`: frontend (prompt box, preview, download)
- `api/generate.js`: backend (AI ko call karta hai, API key chhupa rehti hai)

## Deploy (bilkul free)

### 1. Free AI key lo
1. https://aistudio.google.com par Google account se login karo.
2. "Get API key" dabao aur key copy karo. Free tier me limit hoti hai, to zyada traffic par rate-limit error aa sakta hai.

### 2. Code GitHub par daalo
1. github.com par naya repository banao (jaise `ai-website-builder`).
2. Is zip ki files upload karo (folder structure waisa hi rakho: `index.html` aur `api/generate.js`).

### 3. Vercel par live karo (free domain milega)
1. https://vercel.com par GitHub se sign up karo.
2. "Add New Project" me apna repository import karo.
3. **Environment Variables** me add karo: `GEMINI_API_KEY` = aapki key.
4. Deploy dabao. 1 minute me aapko `https://aapka-naam.vercel.app` jaisa free link milega.

Naam badalna ho to Vercel Project Settings → Domains me `.vercel.app` ka naya naam chuno.
Alternative free hosts: Cloudflare Pages (`.pages.dev`), Netlify (`.netlify.app`).

### 4. Google search me laana
Live hone ke baad bhi Google apne aap turant nahi dikhata. Ye karo:
1. https://search.google.com/search-console par jao, "URL prefix" me apna link daalo.
2. Verify karo (HTML tag method sabse aasaan hai: tag `index.html` ke `<head>` me daalo, phir redeploy).
3. "URL Inspection" me apna link daalo aur "Request indexing" dabao.
4. Index hone me kuch din se hafte lag sakte hain. Jitna accha content aur backlinks, utna jaldi.

## Dhyan rakhne wali baatein
- Ye builder sirf preview aur download deta hai. Users ki banayi websites aapke server par host nahi hoti. Agar chahte ho ki har website ka apna link ho, to database/storage chahiye (Supabase ya Vercel Blob ka free tier use kar sakte ho).
- Free API key par daily limit hoti hai. Public karne se pehle `api/generate.js` me rate limit rakha hai, par badi traffic ke liye login system jodna behtar hoga.
- Model ka naam badalna ho to env variable `GEMINI_MODEL` set karo.
