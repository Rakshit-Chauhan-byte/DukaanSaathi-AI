# DukaanSathi AI 🛍️

**AI-powered marketing assistant for small Indian businesses**

Generate WhatsApp promotions, product listings, and customer replies — in English, Hindi, or Hinglish — in seconds, powered by open-weight models via Hugging Face Inference.

> Built as a Hacktoberfest side project. Open-source, no authentication, no database.

Deployed link : https://dukaansaathi-ai-gamma.vercel.app/

---

## ✨ Features

| Feature | Details |
|---|---|
| Content types | WhatsApp message, Product listing, Customer reply |
| Languages | English, हिंदी, Hinglish |
| Tones | Friendly, Professional, Festive |
| Output actions | Generate, Regenerate, Edit, Copy |
| Draft history | Saved to browser `localStorage` |
| Sample data | One-click demo fill |
| Validation | Client + server-side |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A free [Hugging Face](https://huggingface.co) account

### 1. Clone the repository

```bash
git clone https://github.com/Rakshit-Chauhan-byte/DukaanSaathi-AI.git
cd DukaanSaathi-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Hugging Face API token:

```env
HF_TOKEN=hf_your_token_here
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
```

Get your free token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
The default model (`Mistral-7B-Instruct-v0.3`) is available on the free tier.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `HF_TOKEN` | ✅ Yes | — | Hugging Face API token |
| `HF_MODEL` | No | `mistralai/Mistral-7B-Instruct-v0.3` | Model ID on HF Inference API |

### Recommended free-tier models

- `mistralai/Mistral-7B-Instruct-v0.3` (default, great quality)
- `HuggingFaceH4/zephyr-7b-beta` (fast)
- `google/gemma-2-2b-it` (lightweight)

Pro-tier models (require HF Pro subscription):
- `meta-llama/Llama-3.1-8B-Instruct`

---

## 🏗️ Architecture

```
dukaansaathi-ai/
├── app/
│   ├── layout.tsx          # Root layout, Inter font, SEO metadata
│   ├── page.tsx            # Main page — hero, form, output panel
│   ├── globals.css         # Design system (CSS custom properties)
│   └── api/
│       └── generate/
│           └── route.ts    # Server-side API route → Hugging Face
├── components/
│   ├── ProductForm.tsx     # Form with all fields + validation UI
│   ├── OutputPanel.tsx     # Output display, edit, copy, regenerate
│   ├── DraftHistory.tsx    # localStorage draft browser
│   └── Spinner.tsx         # Loading spinner SVG
├── lib/
│   ├── types.ts            # Shared TypeScript types + constants
│   ├── validation.ts       # Input validation (shared client/server)
│   └── storage.ts          # localStorage helpers for draft history
├── .env.example            # Template — copy to .env.local
└── README.md
```

**Data flow:**
1. User fills the form → client validates → `POST /api/generate`
2. Route handler validates again → calls HF chat-completions API
3. Response streamed back as JSON → displayed in output panel
4. Draft saved to `localStorage`

The `HF_TOKEN` is only read inside the Next.js API route and **never sent to the browser**.

---

## 🚢 Deployment

### Vercel (recommended)

1. Push your fork to GitHub
2. Import in [vercel.com/new](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard:
   - `HF_TOKEN` — your Hugging Face token
   - `HF_MODEL` — (optional) override the model
4. Deploy

### Other platforms

Any Node.js host that supports Next.js App Router:
- Netlify (via `@netlify/plugin-nextjs`)
- Railway, Render, Fly.io — deploy as a Docker container

For Docker:
```bash
npm run build
# Then run with node_modules present and env vars set
```

---

## ⚠️ Limitations

- **AI accuracy:** The model generates plausible text but may occasionally produce awkward phrasing, especially in Hindi/Hinglish. Always review before publishing.
- **No local inference:** Content is sent to Hugging Face hosted servers. This is clearly disclosed to users in the UI.
- **Rate limits:** Free HF tokens are subject to rate limiting. If you see 429 errors, wait a few seconds and try again.
- **Model loading:** First request after inactivity may take 20–30 seconds while the model loads (cold start).
- **No authentication:** Anyone who can access the URL can use the app. Add a middleware auth layer before public deployment if needed.
- **Token limits:** Generation is capped at 512 tokens. Very long product descriptions may be trimmed.
- **No streaming:** Responses are returned all at once, not word-by-word.

---

## 🛡️ Honesty commitments

- The app clearly states it uses a **hosted AI model** (not local inference).
- User data is **sent to Hugging Face servers** for inference — this is disclosed in the footer.
- The system prompt explicitly instructs the model **not to invent** discounts, specifications, reviews, or guarantees.
- No analytics, no tracking, no database.

---

## 🧑‍💻 Development

```bash
# Type check
npx tsc --noEmit

# Build for production
npm run build

# Lint
npm run lint
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

*DukaanSathi AI — because every dukaan deserves a smart saathi.* 🇮🇳
