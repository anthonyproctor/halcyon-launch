# Narration audio on Cloudflare R2

TL;DR: the mp3s move from git and Vercel to the R2 bucket `halcyon-audio`, under their repo paths with each take's hash in the name. The code is ready and does nothing until
`config.js` gets the audio domain. Order: set up the bucket, sync, verify, flip `config.js`, deploy, watch it for a while. Only after that,
take the mp3s out of git, and later rewrite history. Approved by Anthony 2026-10-12.

## How it works

- **One switch.** `config.js` sets `window.HALCYON_AUDIO_BASE`. Empty (today): every mp3 plays from the site, like it always has.
  Set to `https://<audio domain>` (no trailing slash needed): mp3s play from there.
- **One helper.** `engine.js` `AU(path)` is the only place an mp3 URL gets built: page narration, both Audiobook editions, car mode,
  the Audiobook download link, cast voice samples, ambience and stings. A listed file becomes
  `AUDIO_BASE/<repo path with .<hash> before .mp3>`. Each R2 key is one take: `audio/v2/pages/f1/open.0123456789ab.mp3`,
  `courses/pilot/audio/full-ch03.<hash>.mp3`, `cast/v2/voice/sam.<hash>.mp3`. The hash is the first 12 hex of the file's MD5.
- **The manifest decides.** `audio-manifest.json` (repo root, in git, written only by `tools/r2_sync.py`) maps each mp3 that has been
  uploaded and checked to the first 12 hex of its MD5. If a file isn't listed, it plays from the site. With no manifest, everything plays
  from the site even after the flip.
- **Remote only (later).** `HALCYON_AUDIO_REMOTE_ONLY = true` in `config.js` is for step 5 below, after the mp3s leave git. Boot then waits
  up to 10 s for the manifest instead of 1 s, since the site has no copy to play in the meantime.
- **Fallback.** If a listed file fails to load from R2 (a 404 from a partial upload, a network error), `audioGuard()` switches that element to
  the site's copy, keeps the position, speed, and play state, and remembers the file so the rest of the visit goes straight to the site.
  The page never sees the failure. The cast page's Hear button stays, and the player diagnostics (Guide page) log `audio fallback <path>`.
- **JSON stays on Vercel**: page timings, `audiobook.json`, `bookmarks.json`, `episodes/*.json`, `samples.json`. It deploys together with the
  manifest, so the words the app highlights always match the take the manifest points at. A tab left open across a deploy re-reads the
  manifest (at most once a minute) before it fetches a page's timings or the Audiobook list, so an old tab doesn't pair new timings with an old take.
- **Service worker.** It never caches an mp3 on its own, no matter where it lives (`/audio/`, `courses/*/audio/`, or the R2 domain, which is cross-origin
  and passes straight through). The one exception is a chapter the reader saved for offline: engine.js puts it in the `halcyon-offline-audio` cache, and sw.js answers
  that URL from there with a 200 or a 206. `config.js` is part of the app shell (cache `halcyon-v21`).
- **QA reports** still record the file's path (`/audio/v2/pages/f1/open.mp3`), not the R2 host. `HalcyonState().src` maps it back.

### Why re-renders are safe (cache policy)

Keys are content-addressed. A re-render uploads a new key (`open.<new hash>.mp3`) and never touches the old one. So:

- the deployed site keeps playing the take its own manifest names, and that matches its own timings, until the new manifest deploys with
  the new timings. Uploading at render time, before the deploy, is safe.
- a Vercel Instant Rollback, a `git revert`, or a discarded render points back at a take that's still in the bucket.
- no key ever changes its bytes, so objects are stored `Cache-Control: public, max-age=31536000, immutable`. Browsers and Cloudflare can keep
  them forever, and no cache rule about query strings matters.

The sync tool writes a manifest entry only after it has uploaded that exact take and R2's ETag matches the file's MD5. Uploads are single PUTs,
never multipart, so the ETag stays the MD5, and `Content-MD5` makes R2 reject a damaged body. Old takes stay in the bucket (storage is cheap)
until `--prune`. Prune never deletes a take named by the working tree, the manifest at HEAD, or the live site's `audio-manifest.json`, and it
refuses to run at all if it can't read the live one.

First design, replaced after review: keys equal to repo paths, with `?v=<hash>` and a 1-day max-age. It broke the moment a render uploaded
before its deploy, because the live site's `?v=old` URL then fetched the new bytes and cached them.

### What needs CORS

Playing audio doesn't. An `<audio>` element with no `crossorigin` attribute loads cross-origin media without CORS, and that's all the app
does today. The download link is a navigation, not a fetch. CORS is needed for:

- `tools/r2_sync.py --verify`, which checks the header so the policy is proven before the flip
- any future `fetch()` of an mp3: an offline or car download into Cache Storage, a blob download, a duration or HEAD probe, Web Audio,
  or adding `crossorigin` to the elements

Policy (also in `tools/r2_cors.json`). This is the **dashboard** format: paste it into R2, then `halcyon-audio`, then Settings, then CORS Policy.
(`aws s3api put-bucket-cors` needs it wrapped as `{"CORSRules": [...]}`, and wrangler has its own schema.)

```json
[
  {
    "AllowedOrigins": [
      "https://halcyon-launch.vercel.app",
      "http://localhost:4321",
      "http://127.0.0.1:4321",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges", "ETag"],
    "MaxAgeSeconds": 86400
  }
]
```

`localhost:4321` is the test server (`tests/serve.mjs`). `localhost:3000` is `vercel dev`. Vercel preview URLs aren't listed because R2 doesn't take
wildcard subdomains. Previews play fine without CORS. If the site ever gets its own domain, add it here. Browsers cap the preflight cache
(Chrome at 2 hours), so `MaxAgeSeconds` above that just means "as long as the browser allows".

### The download button

Browsers ignore `<a download>` on a cross-origin link. So the sync tool stores the whole-chapter files (`full-chNN.mp3`, `story/full-chNN.mp3`)
with `Content-Disposition: attachment; filename="halcyon-<course>-chNN-<story|study>.mp3"`. Tapping ⬇ still downloads, and now the story and
study editions get different names. Media elements ignore the header, so playback isn't affected. Confirm that on the iPhone in step 3.

## In scope

| Course | Synced (all `*.mp3`) |
|---|---|
| pmp | `audio/` (v2 pages, both Audiobook editions, ambience `audio/amb/`, stings), `cast/voice/`, `cast/v2/voice/` |
| any other (`pilot`, `cisa`, ...) | `courses/<id>/audio/`, `courses/<id>/cast/voice/` |

`voice-samples/` and `cast-src/` aren't loaded by the engine and are gitignored, so they're out of scope.

## One-time setup (Anthony)

1. **Bucket** `halcyon-audio`. Connect a custom domain on the Cloudflare zone (R2, then the bucket, then Settings, then Custom Domains). Leave
   the `r2.dev` URL off. No cache rules are needed: every key is immutable.
2. **CORS**: paste the JSON above.
3. **API token**: R2, then Manage API tokens, then Object Read & Write, **scoped to `halcyon-audio` only**. Store it in the login keychain.
   `zsh tools/r2_keys.sh` reads each value from the clipboard and checks its shape. Note it passes the value as `-w "$v"`, so it's briefly
   on `security`'s command line, and it leaves the last value on the clipboard. Clear that with `pbcopy </dev/null`. By hand,
   ending each command with `-w` makes `security` prompt, so the secret never lands in shell history:
   ```sh
   security add-generic-password -U -a halcyon -s r2-access-key-id -w
   security add-generic-password -U -a halcyon -s r2-secret-access-key -w
   security add-generic-password -U -a halcyon -s r2-endpoint -w     # https://<account id>.r2.cloudflarestorage.com, or just the account id
   ```
   On 2026-10-12 all three items existed with 8-character placeholder values. The tool treats those as "not configured" and says so without
   showing them.

## Turning it on

```sh
cd ~/Documents/halcyon-launch
python3 tools/r2_sync.py --dry-run            # lists the bucket, shows what would upload (~3.1 GB the first time), changes nothing
python3 tools/r2_sync.py                      # uploads, checks each ETag, writes audio-manifest.json
python3 tools/r2_sync.py --verify --base https://<audio domain>   # every whole chapter + 20 random clips: 206 on Range, audio/mpeg,
                                                                   # ETag = the manifest's take, CORS header, immutable, download header
python3 tools/r2_sync.py --verify --base https://<audio domain> --all   # every file, if you want it
```

Then:

1. **Try it locally.** Put the domain in `config.js`, run `node tests/serve.mjs`, and open `http://localhost:4321`. Play a chapter page, the
   Audiobook, a cast sample. In DevTools, Network, the mp3s should come from the audio domain as `<name>.<hash>.mp3`.
   `npx playwright test -c tests/playwright.config.mjs` should pass. (`audio_hosting.spec.mjs` checks the live value is `""`. Change that
   expectation in the same commit as the flip.)
2. **Flip.** Commit `config.js` (the domain), `audio-manifest.json`, and the test expectation. Push. Vercel deploys.
3. **Check the live site.** Do the same DevTools check on `https://halcyon-launch.vercel.app` on desktop and on the iPhone home-screen app
   (the service worker updates to `halcyon-v21` on the next load). Download a chapter with ⬇.
4. **Rollback** while the mp3s are still in git: set `HALCYON_AUDIO_BASE = ""` and deploy. Nothing else changes.

## Re-rendering after the flip

- `tools/narrate_v2.sh`, `narrate_pilot.sh`, and `narrate_course.sh` (and `revoice_gemini.sh`, which calls the last two) end each chapter with
  `tools/r2_sync.py --if-configured --quiet --course <id> --chapter <n>`. With credentials, it uploads only that chapter's changed files and
  updates the manifest. Without them, it stays silent and only drops manifest entries whose file changed, so the new take plays from the site
  instead of the old one playing from R2. In remote-only mode (step 5 on) that would leave the files with no audio, so the hook prints a loud
  warning listing them and exits 5 instead. The render keeps going.
- **Commit `audio-manifest.json` with the chapter**, in the same deploy as its timings JSON.
- Other tools that write mp3s have no hook: `render_pages_gemini.py` and `render_pages.py` run on their own, `rerender_pages.py`,
  `redo_endings.py`, `render_kokoro.py`, `render_episode.py`, `render_full.sh`, `add_stings.sh`, `sting.py`, `ambience.py`, `render_cast.py`,
  `cast_samples.py`, and the `cast_voice_*.py` scripts. After any of them, run `python3 tools/r2_sync.py --course <id>`.
- The safety net is `python3 tools/r2_sync.py --check`. It's local only and fails if any manifest entry no longer matches its file. Install it
  as a pre-commit hook once (`ln -sf ../../tools/pre-commit .git/hooks/pre-commit`). It runs only when a commit stages an mp3 or the manifest,
  and does nothing until `audio-manifest.json` exists.
- Nothing is ever deleted from the bucket unless you pass `--prune`. More than 25 deletions also need `--yes`, and the tool refuses to prune a
  scope that has no local files, so a clone without audio can't empty the bucket.

## Taking the mp3s out of git (after R2 has run live with no problems)

Don't do this until the live site has played from R2 for a while. Once the mp3s leave Vercel, the fallback has nothing to fall back to,
and rollback means re-adding them.

1. Back up the audio:
   `rsync -a --include='*/' --include='*.mp3' --exclude='*' ~/Documents/halcyon-launch/ ~/Backups/halcyon-audio-$(date +%F)/`
2. `python3 tools/r2_sync.py --check && python3 tools/r2_sync.py --verify --base <domain> --all`. Both must pass.
3. Uncomment the audio block in `.gitignore`.
4. Untrack the files without deleting them:
   ```sh
   git ls-files -z '*.mp3' | xargs -0 git rm --cached --quiet --
   git commit -m "Audio: mp3s live on R2 (docs/AUDIO_HOSTING.md); stop tracking them"
   ```
5. CI (`.github/workflows/smoke.yml`): the tests play real mp3s, so add this before `npm run test:smoke`:
   `- run: python3 tools/r2_sync.py --pull` (it reads the base from `config.js`, needs no credentials, and checks every file against the
   manifest hash).
6. Set `HALCYON_AUDIO_REMOTE_ONLY = true` in `config.js` in the same commit. From here, a site-copy fallback would 404.
7. Push. Vercel redeploys without the mp3s. Spot-check the live site again.

What changes for clones: a fresh clone has no audio. Run `python3 tools/r2_sync.py --pull` (`--course pilot` for one course) to fill it from
R2. The render pipeline works the same and needs the keychain token to publish.

## Rewriting history (optional, later; never run by an agent)

The repo is **public** on GitHub, and `.git` is about 5.4 GB, almost all of it mp3 history. Rewriting shrinks clones, but it's
irreversible on the remote. It needs Anthony at the keyboard.

1. **Back up**, two ways:
   ```sh
   git clone --mirror https://github.com/anthonyproctor/halcyon-launch.git ~/Backups/halcyon-launch-pre-filter-$(date +%F).git
   tar -C ~/Documents -czf ~/Backups/halcyon-launch-worktree-$(date +%F).tgz halcyon-launch
   ```
2. **Rewrite a fresh clone** (filter-repo refuses to run on a working copy with history it didn't make, which is a good guard):
   ```sh
   git clone https://github.com/anthonyproctor/halcyon-launch.git /tmp/halcyon-filter && cd /tmp/halcyon-filter
   git filter-repo --analyze                                  # read .git/filter-repo/analysis/ first
   git filter-repo --invert-paths --path-regex '\.mp3$'       # every mp3 ever committed (all are under the scopes above, checked 2026-10-12)
   git count-objects -vH                                      # should drop from GBs to MBs
   ```
3. **Force push** (turn off branch protection on `main` first, if it's on):
   ```sh
   git remote add origin https://github.com/anthonyproctor/halcyon-launch.git
   git push --force --all origin && git push --force --tags origin
   ```
4. **Vercel** redeploys from the new `main` automatically. Check the deploy and the live site. Older Vercel deployments keep their own files.
5. **Every other clone** must be replaced, not pulled. That includes `~/Documents/halcyon-launch`, any other machine, and any agent worktree.
   Re-clone next to it, move the mp3s and any uncommitted work across (or `--pull` them), then swap the folders. Don't keep working in the
   old copy. Its old history and branches still hold every mp3 and would push it all back up. A copy still at a commit from before the
   untrack step would also delete its local mp3s on `git reset --hard`, because the reset removes files that were tracked before and aren't now.
6. **GitHub keeps old objects** reachable from forks and cached PR refs for a while. Because the repo is public, anyone could already have the
   old history. Ask GitHub Support to run a GC if the storage number matters.

## Files

- `config.js`: the switch (`HALCYON_AUDIO_BASE`) and `HALCYON_AUDIO_REMOTE_ONLY`, loaded first by `index.html`
- `tools/pre-commit`: the optional git hook that runs `--check`
- `engine.js`: `AU()`, `audKey()`, `audioGuard()`, `audioLocal()`, the manifest load (`AUD.ready`: boot waits at most 1 s, or 10 s in remote-only
  mode) and `audFresh()` (re-reads it in a long-open tab)
- `sw.js`: never caches an mp3, `config.js` in the shell, cache `halcyon-v21`
- `tools/r2_sync.py`: sync, `--check`, `--verify`, `--pull`. Stdlib Python plus the AWS CLI. No boto3 in `.ttsvenv`, and nothing was installed.
- `tools/r2_cors.json`: the bucket CORS policy
- `audio-manifest.json`: written by the sync, committed with each chapter (it doesn't exist until the first sync)
- `tests/audio_hosting.spec.mjs`: the engine with the base set and empty. `tests/r2_sync.spec.mjs` covers the tool against a fake R2 and keychain
  (`tests/fixtures/r2bin/`).
