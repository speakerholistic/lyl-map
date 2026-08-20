# LYL Map — Netlify Deployment Guide

## Prerequisites
- Netlify account (free tier works fine)
- This project pushed to a GitHub (or GitLab / Bitbucket) repository
- A Google Maps API key with **Maps JavaScript API** and **Places API** enabled

---

## Step 1 — Push to GitHub

Make sure your code is in a GitHub repo. If it isn't yet:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2 — Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorise Netlify
4. Select your repository

---

## Step 3 — Build Settings

The `netlify.toml` file at the repo root handles this automatically, but double-check:

| Setting | Value |
|---|---|
| Base directory | `apps/web` |
| Build command | `yarn build` |
| Publish directory | `.next` |
| Node version | `20` |

---

## Step 4 — Environment Variables

In Netlify dashboard → **Site configuration** → **Environment variables**, add:

### Required
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
DATABASE_URL=your_neon_postgres_connection_string
```

### Auth (if you have sign-in enabled)
```
AUTH_SECRET=your_random_secret_string
BETTER_AUTH_SECRET=your_random_secret_string
BETTER_AUTH_URL=https://your-site.netlify.app
BETTER_AUTH_TRUSTED_ORIGINS=https://your-site.netlify.app
```

> **Tip:** Generate a secret with `openssl rand -hex 32` in your terminal.

---

## Step 5 — Deploy

1. Click **"Deploy site"**
2. Netlify installs `@netlify/plugin-nextjs` automatically from `netlify.toml`
3. Build takes ~2–3 minutes
4. Your site goes live at `https://[random-name].netlify.app`

---

## Step 6 — Custom Domain (Optional)

1. **Domain management** → **Add custom domain**
2. Enter your domain and follow the DNS instructions
3. Netlify provisions a free SSL certificate automatically

---

## Step 7 — Continuous Deployment

Every push to your `main` branch triggers an automatic rebuild. No action needed.

---

## Troubleshooting

### Map doesn't load / blank white area
- Confirm `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in Netlify env vars
- In Google Cloud Console, make sure **Maps JavaScript API** and **Places API** are both enabled
- Add your Netlify domain to the API key's **HTTP referrer restrictions**

### Autocomplete city search not working
- Confirm **Places API** is enabled (separate from Maps JavaScript API)
- Check the browser console for `REQUEST_DENIED` errors — usually means Places API isn't enabled or the key is restricted

### Build error: Module not found
- Likely a missing package — check the build log for the specific import
- Make sure Node version is set to `20` in environment variables

### Database / API routes return 500
- Verify `DATABASE_URL` is set correctly
- Neon DB connection strings look like: `postgresql://user:pass@host/dbname?sslmode=require`

---

## Embed in Kajabi / Other Sites

Once deployed you can embed the map as an iframe:

```html
<iframe
  src="https://your-site.netlify.app/map"
  width="100%"
  height="900px"
  frameborder="0"
  title="LYL Map"
  allow="geolocation"
></iframe>
```

---

## Support

- Netlify docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js/overview/
- Google Maps API: https://developers.google.com/maps/documentation
