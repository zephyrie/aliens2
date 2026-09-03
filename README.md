# Aliens: Fireteam Elite 2 — Build Compendium

**[zephyrie.com/aliens2](https://zephyrie.com/aliens2/)**

A build guide for *Aliens: Fireteam Elite 2*, assembled by transcribing the
community's launch-week build videos and cross-checking what they agreed on.

The game launched 2026-08-25. In that first week the only real documentation was
34 hours of YouTube commentary spread across 33 channels — accurate in places,
contradictory in others, and impossible to search. This project pulls the captions,
reconciles the claims, and lays the result out as a single reference: six classes,
eleven builds, weapon and augment tables, each build citing the videos it came from.

Everything here is community consensus, not official data. See **[SOURCES.md](SOURCES.md)**
for the full credit list.

## The site

`site/` is plain HTML and JS with no build step — open `site/index.html`, or:

```bash
python3 -m http.server 8899 --directory site
```

Routing is hash-based and every build is directly linkable:

```
#/                                     overview & class tiers
#/hunter                               class page (redirects to its first build)
#/hunter/hunter-pike                   a specific build
#/weapons  #/gear                      reference tables
```

Content lives in four data files that the page reads at load:
`data-core.js` (game overview, tier lists), `data-classes.js` (kits, perks, builds),
`data-weapons.js` (weapon and augment tables), `data-images.js` (frame references).

## The pipeline

How the corpus behind the guide gets built. Run from the repo root:

```bash
uv sync                                            # yt-dlp
npm i playwright                                   # for the search steps

node pipeline/search_youtube.mjs "query" --json data/search/sweep.json
node pipeline/search_batch.mjs queries.json data/search/sweep.json
jq -r '.results[].url' data/shortlist.json > data/urls.txt

pipeline/fetch_captions.sh                         # yt-dlp -> captions/*.vtt (no video)
uv run python pipeline/parse_captions.py           # VTT  -> data/transcripts.json
uv run python pipeline/make_packs.py               # -> reading/<class>.txt
uv run python pipeline/make_sources.py             # -> SOURCES.md, data/videos.json
uv run python pipeline/grab_frames.py jobs.json    # -> site/img/frames/*.jpg
```

| Step | What it does |
|---|---|
| `search_youtube.mjs` / `search_batch.mjs` | Scrape YouTube search for candidate videos (Playwright). |
| `fetch_captions.sh` | Pull English subtitles with `yt-dlp` — captions only, never the video. |
| `parse_captions.py` | VTT → timestamped transcripts, undoing YouTube's rolling-caption repetition. Drops pre-launch and sub-200-word videos. |
| `make_packs.py` | Group transcripts per class, strip sponsor/promo lines, emit readable packs. |
| `make_sources.py` | Derive the public credit list and metadata index. |
| `grab_frames.py` | Resolve a stream URL per video, pull single frames with `ffmpeg` at chosen timestamps. |

The last step — turning `reading/` into `site/data-*.js` — is judgment, not code.
Claims that only one creator makes are marked as such on the site; claims several
independently agree on are stated plainly.

`tools/` holds Playwright helpers for checking the site renders (`check_site.mjs`
walks every route at desktop and mobile widths looking for console errors and
layout overflow).

## What is and isn't in this repo

Captions and transcripts are fetched locally for analysis and **not redistributed** —
`captions/`, `data/transcripts.json` and `reading/` are gitignored. What ships is
the metadata record of what was used (`data/videos.json`, `SOURCES.md`), the search
sweeps (`data/search/`), the pipeline, and the site.

Re-run the pipeline to rebuild the corpus from scratch.

## Layout

```
site/            the published guide (GitHub Pages serves this directory)
pipeline/        corpus builder, in run order
tools/           Playwright checks for the site
lib/             shared JS helpers
data/            search sweeps, shortlist, video metadata, frame report
SOURCES.md       every video the guide draws on, grouped by channel
```

## License

Code and prose in this repo: [MIT](LICENSE). The linked videos belong to their
creators; *Aliens: Fireteam Elite 2* and its assets belong to Cold Iron Studios
and 20th Century Studios. Frame stills are used for identification and reference.
