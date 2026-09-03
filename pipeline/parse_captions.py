#!/usr/bin/env python3
"""Turn yt-dlp VTT files into deduped, timestamped transcripts."""
import json, glob, os, re, sys, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # repo root


def ts(t):
    h, m, s = t.split(':')
    return round(int(h)*3600 + int(m)*60 + float(s), 2)

TAG = re.compile(r'<[^>]+>')
CUE = re.compile(r'^(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})')

def parse_vtt(path):
    """Yield (start, text) cues with YouTube's rolling-caption duplication removed."""
    cues, start = [], None
    buf = []
    for line in open(path, encoding='utf-8', errors='replace'):
        line = line.rstrip('\n')
        m = CUE.match(line)
        if m:
            if start is not None and buf:
                cues.append((start, ' '.join(buf)))
            start, buf = ts(m.group(1)), []
        elif start is not None:
            txt = html.unescape(TAG.sub('', line)).strip()
            if txt and txt != 'align:start position:0%':
                buf.append(txt)
    if start is not None and buf:
        cues.append((start, ' '.join(buf)))

    # Rolling captions repeat the previous line; keep only newly-appended words.
    out, prev_words = [], []
    for t, text in cues:
        words = text.split()
        if not words:
            continue
        if words == prev_words:
            continue
        # find longest suffix of prev that prefixes current
        overlap = 0
        for k in range(min(len(prev_words), len(words)), 0, -1):
            if prev_words[-k:] == words[:k]:
                overlap = k
                break
        new = words[overlap:]
        if new:
            out.append((t, ' '.join(new)))
        prev_words = words
    return out

def pick(vtts):
    """Prefer a manual English track; fall back to the auto 'orig' track."""
    plain = [p for p in vtts if re.search(r'\.en\.vtt$', p)]
    orig  = [p for p in vtts if re.search(r'\.en-orig\.vtt$', p)]
    other = [p for p in vtts if p not in plain + orig]
    for group in (plain, orig, other):
        if group:
            return max(group, key=lambda p: os.path.getsize(p))
    return None

by_id = {}
for p in glob.glob(str(ROOT / 'captions/*.vtt')):
    vid = os.path.basename(p).split('.')[0]
    by_id.setdefault(vid, []).append(p)

meta = {}
for p in glob.glob(str(ROOT / 'captions/*.info.json')):
    d = json.load(open(p))
    meta[d['id']] = d

FTE2_CUTOFF = '20260801'
out = {}
skipped = 0
for vid, vtts in by_id.items():
    m = meta.get(vid, {})
    if m.get('upload_date', '') < FTE2_CUTOFF:
        skipped += 1
        continue
    src = pick(vtts)
    cues = parse_vtt(src)
    words = sum(len(t.split()) for _, t in cues)
    if words < 200:
        skipped += 1
        continue
    out[vid] = {
        'id': vid,
        'title': m.get('title'),
        'channel': m.get('uploader'),
        'channel_id': m.get('channel_id'),
        'upload_date': m.get('upload_date'),
        'duration': m.get('duration'),
        'view_count': m.get('view_count'),
        'like_count': m.get('like_count'),
        'description': (m.get('description') or '')[:4000],
        'url': f'https://www.youtube.com/watch?v={vid}',
        'track': os.path.basename(src),
        'word_count': words,
        'cues': cues,
    }

json.dump(out, open(ROOT / 'data/transcripts.json', 'w'), indent=1)
tw = sum(v['word_count'] for v in out.values())
th = sum(v['duration'] or 0 for v in out.values())/3600
print(f"parsed {len(out)} FTE2 transcripts ({skipped} skipped: FTE1 or too short)")
print(f"{tw:,} words, {th:.1f} hours of source video")
