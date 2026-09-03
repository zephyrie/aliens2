#!/usr/bin/env python3
"""Build the public source record from the local corpus.

Writes two things, neither containing transcript text:
  data/videos.json  — metadata for every video in the corpus, flagged by whether
                      the site cites it directly
  SOURCES.md        — human-readable credit list, grouped by channel

Cited ids come from the GUIDE.sources block in site/data-classes.js, so the
credit list can never drift from what the pages actually reference.
"""
import json, re, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEEP = ('id', 'title', 'channel', 'channel_id', 'upload_date',
        'duration', 'view_count', 'like_count', 'url', 'word_count')


def cited_ids():
    """Pull the keys of GUIDE.sources out of the site data file."""
    s = (ROOT / 'site/data-classes.js').read_text()
    m = re.search(r'GUIDE\.sources\s*=\s*\{(.*?)\n\};', s, re.S)
    if not m:
        raise SystemExit('could not find GUIDE.sources in site/data-classes.js')
    return set(re.findall(r"^\s*'([\w-]{11})'\s*:", m.group(1), re.M))


cited = cited_ids()
corpus = json.load(open(ROOT / 'data/transcripts.json'))

videos = []
for v in corpus.values():
    row = {k: v.get(k) for k in KEEP}
    row['cited'] = row['id'] in cited
    videos.append(row)
videos.sort(key=lambda v: ((v['channel'] or '').lower(), v['upload_date'] or ''))

missing = cited - {v['id'] for v in videos}
if missing:
    print(f"WARNING: {len(missing)} cited video(s) not in the corpus: {sorted(missing)}")

by_channel = collections.defaultdict(list)
for v in videos:
    by_channel[v['channel']].append(v)

n_cited = sum(v['cited'] for v in videos)
words = sum(v['word_count'] or 0 for v in videos)
hours = sum(v['duration'] or 0 for v in videos) / 3600
dates = sorted(v['upload_date'] for v in videos if v['upload_date'])
fmt_d = lambda d: f"{d[:4]}-{d[4:6]}-{d[6:]}" if d else "—"
span = f"{fmt_d(dates[0])} to {fmt_d(dates[-1])}"

json.dump({
    'generated_from': 'data/transcripts.json + site/data-classes.js',
    'video_count': len(videos),
    'cited_count': n_cited,
    'channel_count': len(by_channel),
    'total_words': words,
    'total_runtime_hours': round(hours, 1),
    'upload_date_span': span,
    'videos': videos,
}, open(ROOT / 'data/videos.json', 'w'), indent=1)


def fmt_views(n):
    if not n: return "—"
    if n >= 1_000_000: return f"{n/1_000_000:.1f}M"
    if n >= 1_000: return f"{n/1_000:.0f}K"
    return str(n)


def row(v):
    title = (v['title'] or v['id']).replace('|', '\\|')
    mark = ' ★' if v['cited'] else ''
    return (f"| [{title}]({v['url']}){mark} | {fmt_d(v['upload_date'])} "
            f"| {(v['duration'] or 0)//60}m | {fmt_views(v['view_count'])} |")


L = [
    "# Sources",
    "",
    "The [build compendium](https://zephyrie.com/aliens2/) was written by transcribing and",
    "cross-reading the community videos below. Nothing here is official — it is what creators",
    "worked out in the first week after launch.",
    "",
    f"**{len(videos)} videos · {len(by_channel)} channels · {hours:.1f} hours ·",
    f"{words:,} transcribed words · uploaded {span}**",
    "",
    f"This is the corpus the pipeline collected and packed for reading. **★ marks the {n_cited}",
    "videos the build pages cite directly**; the rest are the surrounding context the guide was",
    "written against — used to corroborate claims, settle tier placement, or rule things out.",
    "",
    "Captions were pulled with `yt-dlp` for analysis and are not redistributed in this repo.",
    "`data/videos.json` carries the same list in machine-readable form. If you are one of these",
    "creators and want a link changed or removed, open an issue.",
    "",
    "---",
    "",
]

for channel in sorted(by_channel, key=str.lower):
    vids = sorted(by_channel[channel], key=lambda v: v['upload_date'] or '')
    cid = vids[0]['channel_id']
    star = ' ★' if any(v['cited'] for v in vids) else ''
    L += [f"### [{channel}](https://www.youtube.com/channel/{cid}){star}" if cid
          else f"### {channel}{star}", "",
          "| Video | Uploaded | Length | Views |", "|---|---|---|---|"]
    L += [row(v) for v in vids]
    L.append("")

(ROOT / 'SOURCES.md').write_text('\n'.join(L))
print(f"SOURCES.md + data/videos.json: {len(videos)} videos ({n_cited} cited), "
      f"{len(by_channel)} channels, {words:,} words, {hours:.1f}h")
