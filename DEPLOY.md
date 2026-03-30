# Her Ruby — Deployment Guide
## Three repos. Three Vercel projects. One brand.

---

## What you're deploying

| Repo | URL | Platform |
|---|---|---|
| `herruby-web` | `herruby.ca` | Vercel |
| `herruby-flyer` | `event.herruby.ca` or `herruby-flyer.vercel.app` | Vercel |
| `herruby-app` | `app.herruby.ca` | Vercel |

Each is a **standalone Next.js 14** project with no monorepo dependencies. Push each one to its own GitHub repo, then connect to Vercel individually.

---

## Prerequisites

- **GitHub account** — github.com (free)
- **Vercel account** — vercel.com (free Hobby plan works)
- **Supabase account** — supabase.com (free tier works for pilot)
- **Node.js 18+** installed for local testing

---

## Step 0 — Supabase setup (do this once, shared by web + app)

1. Go to **supabase.com** → New project → choose **Canada (Central)** region
2. SQL Editor → paste contents of `herruby-web/supabase/001_schema.sql` → Run
3. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (API only, never expose to browser)

---

## Repo 1 — `herruby-web` (Landing page + /pilot subpage)

### Local dev
```bash
cd herruby-web
cp .env.local.example .env.local
# Fill in your Supabase URL and key
npm install
npm run dev
# → http://localhost:3000
# → http://localhost:3000/pilot
```

### Push to GitHub
```bash
cd herruby-web
git init
git add .
git commit -m "Her Ruby landing page"
git remote add origin https://github.com/YOUR-USERNAME/herruby-web.git
git branch -M main
git push -u origin main
```

### Deploy on Vercel
1. vercel.com → **Add New → Project** → import `herruby-web`
2. Framework: **Next.js** (auto-detected)
3. Root Directory: **`/`** (leave as default — repo root IS the Next.js app)
4. Add environment variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhb...` |
| `NEXT_PUBLIC_EVENTBRITE_URL` | `https://www.eventbrite.ca/e/your-event` |
| `NEXT_PUBLIC_APP_URL` | `https://app.herruby.ca` |

5. Click **Deploy** — takes 2–3 minutes
6. Pages live at:
   - `https://herruby-web.vercel.app` → landing page
   - `https://herruby-web.vercel.app/pilot` → pilot subpage

### Custom domain
Vercel Project → Settings → Domains → add `herruby.ca`

DNS records at your registrar:
```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

---

## Repo 2 — `herruby-flyer` (Pilot event flyer — May 16)

### Local dev
```bash
cd herruby-flyer
cp .env.local.example .env.local
npm install
npm run dev
# → http://localhost:3000
```

### Push to GitHub
```bash
cd herruby-flyer
git init
git add .
git commit -m "Her Ruby pilot event flyer"
git remote add origin https://github.com/YOUR-USERNAME/herruby-flyer.git
git branch -M main
git push -u origin main
```

### Deploy on Vercel
1. Vercel → **Add New → Project** → import `herruby-flyer`
2. Framework: **Next.js** (auto-detected)
3. Root Directory: **`/`**
4. Add environment variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_EVENTBRITE_URL` | `https://www.eventbrite.ca/e/your-event` |

5. Click **Deploy**

### Custom domain (optional)
Add `event.herruby.ca` in Vercel → add CNAME at your registrar:
```
CNAME  event  cname.vercel-dns.com
```

---

## Repo 3 — `herruby-app` (Mobile web app)

### Local dev
```bash
cd herruby-app
cp .env.local.example .env.local
# Fill in Supabase keys
npm install
npm run dev
# → http://localhost:3000
```

### Push to GitHub
```bash
cd herruby-app
git init
git add .
git commit -m "Her Ruby app"
git remote add origin https://github.com/YOUR-USERNAME/herruby-app.git
git branch -M main
git push -u origin main
```

### Deploy on Vercel
1. Vercel → **Add New → Project** → import `herruby-app`
2. Framework: **Next.js** (auto-detected)
3. Root Directory: **`/`**
4. Add environment variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhb...` |
| `NEXT_PUBLIC_STRIPE_KEY` | `pk_test_...` |
| `NEXT_PUBLIC_API_URL` | `https://your-api.railway.app` (optional) |

5. **Important — add Supabase OAuth redirect:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add to Redirect URLs: `https://herruby-app.vercel.app/auth/callback`
   - After custom domain: also add `https://app.herruby.ca/auth/callback`

6. Click **Deploy**

### Custom domain
Add `app.herruby.ca` in Vercel → CNAME at registrar:
```
CNAME  app  cname.vercel-dns.com
```

---

## Replit deployment (herruby-app only)

The app can also run on Replit for demos and testing.

1. Go to **replit.com** → Create Repl → **Import from GitHub**
2. Paste your `herruby-app` GitHub URL
3. Replit auto-detects Node.js
4. In **Secrets** panel (🔒), add:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
5. In Shell: `npm install && npm run build && npm start`
6. Click **Run** — Replit assigns a public URL like `herruby-app.your-username.repl.co`

**Note:** Replit's free tier sleeps after inactivity. Use Vercel for production.

---

## Updating any site after launch

Every change is just 3 commands:
```bash
git add .
git commit -m "Update: describe what changed"
git push
# Vercel auto-redeploys in ~2 minutes
```

---

## File map — what controls what

### herruby-web
| File | Controls |
|---|---|
| `app/page.jsx` | Home page — assembles all sections |
| `app/sections/Hero.jsx` | Hero text + CTAs |
| `app/sections/Solution.jsx` | Four pillars |
| `app/sections/GiftOfHealth.jsx` | Gift section + modals |
| `app/sections/Footer.jsx` | Footer nav + contact form |
| `app/pilot/page.jsx` | `/pilot` subpage |
| `app/components/Nav.jsx` | Navigation bar |
| `lib/tokens.js` | Brand colours, fonts |

### herruby-flyer
| File | Controls |
|---|---|
| `app/page.jsx` | Full flyer page |
| `lib/tokens.js` | Brand colours |
| `.env.local` | Eventbrite URL |

### herruby-app
| File | Controls |
|---|---|
| `app/page.jsx` | Auth router — decides which screen to show |
| `components/LandingPage.jsx` | App landing/splash screen |
| `components/AuthScreen.jsx` | Login + signup |
| `components/OnboardScreen.jsx` | 5-step onboarding |
| `components/KYCScreen.jsx` | Identity verification |
| `components/AppShell.jsx` | Main app with tab bar |
| `components/MyBodyScreen.jsx` | Daily check-in + trends |
| `components/ProgramsScreen.jsx` | Programme booking |
| `components/CircleScreen.jsx` | Community circles |
| `components/WalletScreen.jsx` | Credits + top-up + gift |
| `components/HubScreen.jsx` | Knowledge hub |
| `components/ProfileScreen.jsx` | Settings + notifications |
| `lib/AuthContext.js` | Auth state + Supabase session |
| `lib/WalletContext.js` | Wallet balance state |
| `lib/supabase.js` | Supabase client + auth helpers |
| `lib/api.js` | API calls to Express backend |

---

## Contact
**Her Ruby / Lael Ventures** · info@laelventures.com · Ontario, Canada
