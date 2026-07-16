# KNECT — Buller Food Network directory (branded public site)

A KNECT-branded public directory that reads from your Airtable base and
**refreshes itself once a day**. Tick "Show in public directory" on a business
in Airtable and it appears on the site at the next refresh (or when you run the
refresh manually).

Free to host on GitHub Pages. No coding needed — everything below is done in the
GitHub website.

## What's in this folder
- `index.html` — the branded directory page (design, search, filters)
- `data.json` — the list of businesses (auto-updated by the builder)
- `build.js` — the builder that pulls from Airtable and saves logos
- `logos/` — business logos, saved here automatically
- `.github/workflows/update-directory.yml` — the daily auto-refresh
- `.nojekyll` — tells GitHub Pages to serve the files as-is

## One-time setup (about 10 minutes, all in the browser)

### 1. Make a read-only Airtable key
1. Go to **airtable.com/create/tokens** (signed in as the account that owns the base).
2. Click **Create new token**. Name it `KNECT directory`.
3. Under **Scopes** add `data.records:read` and `schema.bases:read`.
4. Under **Access** add the base **KNECT — Buller Food Network**.
5. Click **Create token** and **copy** the token (starts with `pat...`).
   Keep it somewhere safe for step 4. This key can only read, never change your data.

### 2. Create the GitHub repository
1. At **github.com**, click **New repository**.
2. Name it e.g. `knect-food-directory`. Set it to **Public**. Click **Create**.
3. On the new repo page, click **uploading an existing file**.
4. Drag **everything in this folder** (including the `logos` folder and the
   hidden `.github` folder) into the upload box, then **Commit changes**.
   - If GitHub hides the `.github` folder, upload the other files first, then
     use **Add file → Upload files** again and drag the `.github` folder in.

### 3. Turn on GitHub Pages
1. In the repo, go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**. Click **Save**.
4. Wait ~1 minute. Pages shows your live web address (like
   `https://yourname.github.io/knect-food-directory/`). That's your directory.

### 4. Add the Airtable key as a secret
1. In the repo, go to **Settings → Secrets and variables → Actions**.
2. Click **New repository secret**.
3. Name: `AIRTABLE_TOKEN`  ·  Value: paste the `pat...` token from step 1.
4. Click **Add secret**.

### 5. Do the first data refresh
1. Go to the **Actions** tab → **Update KNECT directory** → **Run workflow**.
2. It pulls your ten businesses and their logos from Airtable and updates the site.

Done. From now on it refreshes every day automatically. To force a refresh any
time (e.g. after adding a business), repeat step 5.

## Changing the look
Open `index.html` and edit it, then upload the new version (Add file → Upload
files). Colours are the KNECT palette near the top of the file.

## Notes
- The page shows only businesses ticked **Show in public directory** in Airtable.
- Only public-safe fields are published (name, category, town, logo, website,
  social, public phone/email). Internal fields never leave Airtable.
- Logos are downloaded into the repo, so they never break (unlike raw Airtable
  image links, which expire).
