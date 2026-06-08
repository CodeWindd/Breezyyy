# Hosting Breezy on GitHub Pages 🌦️

This guide outlines how to host this weather applet on **GitHub Pages** completely free of charge. 

Because GitHub Pages serves static files, our application has been upgraded with **Automatic Hybrid Geolocation & Weather Adapters**—meaning if it detects that the custom Express API proxy server is offline or unavailable (like on GitHub Pages), it will seamlessly fetch directly from Open-Meteo geolocational and meteorological endpoints on the client side.

---

## 🚀 Step-by-Step Setup via GitHub Actions (Recommended)

We have pre-configured a continuous deployment workflow in `.github/workflows/deploy.yml`. This is the easiest, most reliable way to publish your site without needing to configure security keys or run terminal commands locally.

### 1. Push Code to GitHub
Ensure all code (including the `.github` directory) is pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 2. Enable GitHub Pages in Repository Settings (Requires files to exist first!)
Because a brand-new repository has no commits initially, GitHub does not allow turning on Pages or configuring its Source. Now that you have pushed files/commits in Step 1, the Page settings are fully operational!

1. Go to your repository on **GitHub.com**.
2. Click on the ⚙️ **Settings** tab at the top.
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** -> **Source**:
   - Change the selector from **"Deploy from a branch"** to **"GitHub Actions"**.

### 3. Re-run or Trigger the Deployment Action!
Once you change the source to **GitHub Actions**, go to the **Actions** tab of your repository:
1. Click on the failed **Deploy to GitHub Pages** workflow run.
2. Click **Re-run all jobs** in the top right.
3. The deployment will now complete cleanly without token permission or `404 Not Found` errors!
   
### 4. Watch the Magic Happen!
Every time you push code to `main` (or `master`), the workflow will automatically trigger:
1. It builds the static production bundle using Vite.
2. It resolves path structures to be portable (using `./` relative base paths, preventing blank screens).
3. It deploys your site directly to your GitHub Pages URL: `https://<your-username>.github.io/<your-repo-name>/`

---

## 🛠️ Frequently Asked Questions (FAQ) & Troubleshooting

### Why was my GitHub Pages deployment blank before?
By default, most bundlers build with paths relative to the domain root (`/assets/...`). When deployed as a project site (e.g., `github.io/my-weather-app/`), the browser looks for scripts at `github.io/assets/...` instead of `github.io/my-weather-app/assets/...`, resulting in a blank screen and `404 Not Found` console errors. 
**Fix applied:** We modified `vite.config.ts` to use a relative base (`base: "./"`), rendering assets perfectly regardless of what nested folder or domain subpath the site is deployed under!

### Do weather alerts and maps still work?
- Yes! The interactive weather maps, daily trends, hourly graphs, and local searches work perfectly.
- In static mode, the geocoder and weather engines call public APIs directly from your browser, adhering to fully secure CORS standards.
