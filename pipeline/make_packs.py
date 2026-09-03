#!/usr/bin/env python3
"""Group transcripts into per-class reading packs, stripped of promo boilerplate."""
import json, re, collections, os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # repo root


d = json.load(open(ROOT / 'data/transcripts.json'))
CLASSES = ['marauder','machinist','hunter','medic','specialist','duelist']
FIX = [(r'\bfire ?element 2\b','Fireteam Elite 2'),(r'\bfire ?team elite 2\b','Fireteam Elite 2'),
       (r'\bfire ?element\b','Fireteam Elite'),(r'\bdualist\b','Duelist')]
NOISE = re.compile(r'(http|www\.|merch|discord|twitter|tiktok|instagram|patreon|song:|music provided|'
                   r'nocopyrightsounds|epidemic ?sound|business inquir|join this channel|become a member|'
                   r'referral|buy cheap games|subscribe|follow |^#|♪|♫)', re.I)

def clean(t):
    for p,r in FIX: t = re.sub(p,r,t,flags=re.I)
    return t
def trim(desc):
    return '\n'.join(l for l in (desc or '').splitlines() if not NOISE.search(l)).strip()[:1400]
def chapters(desc):
    out=[]
    for m in re.finditer(r'^\s*((?:\d+:)?\d+:\d\d)\s+(.{3,90})$', desc or '', re.M):
        t=m.group(1).split(':'); s=sum(int(x)*60**i for i,x in enumerate(reversed(t)))
        out.append((s,m.group(2).strip()))
    return out

BUILDY = re.compile(r'\b(build|perk|loadout|guide|weapon|class|tier|best)', re.I)
groups = collections.defaultdict(list)
for v in d.values():
    blob = f"{v['title']} {(v['description'] or '')[:400]}".lower()
    hits = [c for c in CLASSES if c in blob]
    for c in (hits or ['general']): groups[c].append(v)

os.makedirs(ROOT / 'reading', exist_ok=True)
for c, vids in groups.items():
    # build/guide videos first, then by views
    vids.sort(key=lambda v: (0 if BUILDY.search(v['title'] or '') else 1, -(v['view_count'] or 0)))
    L=[]
    for v in vids:
        L.append(f"\n{'#'*70}\nVID {v['id']} | {v['title']}\n{v['channel']} | {v['upload_date']} | "
                 f"{v['view_count']:,} views | {(v['duration'] or 0)//60}m")
        t = trim(v['description'])
        if t: L.append("DESC: "+t)
        ch = chapters(v['description'])
        if ch: L.append("CHAPTERS: "+" | ".join(f"{s}s={x}" for s,x in ch))
        L.append("TRANSCRIPT:")
        buf, bt = [], None
        for tt, txt in v['cues']:
            if bt is None: bt = tt
            buf.append(txt)
            if tt-bt >= 25:
                L.append(f"[{int(bt)}s] "+clean(' '.join(buf))); buf, bt = [], None
        if buf: L.append(f"[{int(bt or 0)}s] "+clean(' '.join(buf)))
    open(ROOT / f"reading/{c}.txt", 'w').write('\n'.join(L))
    print(f"  {c:11} {len(vids):2} vids  {os.path.getsize(ROOT / f'reading/{c}.txt')/1024:6.1f} KB")
