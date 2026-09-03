# AGENTS.md

Notes for coding agents working in this repo. Human contributors: see [README.md](README.md).

## What this is

A static build guide for *Aliens: Fireteam Elite 2* (`site/`), plus the pipeline that
built its source corpus (`pipeline/`). No framework, no bundler, no test suite.

## Ground rules

- **Run scripts from the repo root.** Python scripts resolve paths through
  `ROOT = Path(__file__).resolve().parent.parent`, so they work from anywhere, but the
  shell and node steps assume root.
- **Never commit scraped text.** `captions/`, `data/transcripts.json` and `reading/`
  are gitignored on purpose — they are other people's words, held locally for analysis.
  If you regenerate them, they stay untracked. Publish credit, not corpus.
- **`site/` is the Pages root.** `.github/workflows/pages.yml` uploads that directory
  on any push to `main` touching `site/**`. Don't move it or add a build step without
  updating the workflow.
- **No new dependencies for the site.** It is deliberately plain HTML + JS, loaded
  directly from four data files. Keep it that way.

## Editing site content

Content lives in `site/data-*.js`, not in markup:

| File | Holds |
|---|---|
| `data-core.js` | `GUIDE.game`, class tier list, overview copy |
| `data-classes.js` | `GUIDE.sources` (video credits) and `GUIDE.classes[]` — kits, perks, builds |
| `data-weapons.js` | weapon, augment and attachment tables |
| `data-images.js` | `GUIDE.images` — frame stills keyed by build id |

A class object is `{id, name, tier, role, tagline, summary, tierNote, abilities[],
corePerks[], builds[]}`. A build is `{id, name, archetype, tier, ...}` and its `id`
must be globally unique — it is the URL segment.

Every build should cite the video(s) it came from via keys into `GUIDE.sources`.
Where creators disagree, say so on the page rather than picking a winner silently.

## Routing

Hash-based, `#/<class>/<build>`. `route()` in `index.html`:

- a bare or unknown build segment `history.replaceState`s onto the class's first build,
  so every class page settles on a canonical, shareable build URL;
- the build tab strip renders even when a class has only one build, so that build is
  always linkable;
- `mark()` highlights both the class item and the active build sub-item in the nav.

If you add a build, the nav sub-links and tab strip pick it up automatically — there is
no separate list to update.

## Checking your work

There is no unit test suite. Verify visually:

```bash
python3 -m http.server 8899 --directory site &
node tools/check_site.mjs            # walks every route, desktop + mobile
node tools/screenshot.mjs            # writes /tmp/shot_*.png
```

`check_site.mjs` reports console errors and horizontal overflow. A clean run prints no
errors; a Chromium `compute-pressure` permissions-policy notice is background noise and
can be ignored.

Playwright resolves its browser through `lib/browser.mjs`, which picks the newest
`headless_shell` already in `~/.cache/ms-playwright` (the npm-cached build often expects
a revision that was never downloaded). Override with `PW_CHROME=/path/to/chrome`.

## Pipeline gotchas

- `parse_captions.py` reads `captions/*.info.json` for video metadata. Those are yt-dlp
  dumps that only exist after a fetch; they are large and gitignored.
- It also drops anything uploaded before `FTE2_CUTOFF = '20260801'` — the search queries
  pull in a lot of *Fireteam Elite 1* results that must not enter the corpus.
- Rolling-caption dedup in `parse_vtt` is the fiddly part: YouTube auto-captions repeat
  the previous line with a few words appended. It keeps only the new suffix. If transcripts
  come out stuttering, that is the function to look at.
- `grab_frames.py` takes a jobs file: `[{vid, t, name}]`. It caches stream URLs per video
  and skips frames already on disk, so re-running is cheap. Stream URLs expire — a run
  that sat idle for hours will fail and need restarting.
