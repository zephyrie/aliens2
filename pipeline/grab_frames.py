#!/usr/bin/env python3
"""Grab single frames from YouTube videos at given timestamps.

Uses yt-dlp to resolve a direct stream URL, then ffmpeg to seek and pull one
frame. No full video download.
"""
import json, os, subprocess, sys, hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # repo root


OUT = str(ROOT / 'site/img/frames')
os.makedirs(OUT, exist_ok=True)

def stream_url(vid):
    r = subprocess.run(
        ['uv','run','yt-dlp','-f','bestvideo[height<=1080][ext=mp4]/best[height<=1080]',
         '-g', f'https://www.youtube.com/watch?v={vid}'],
        capture_output=True, text=True, timeout=120)
    lines = [l for l in r.stdout.strip().splitlines() if l.startswith('http')]
    return lines[0] if lines else None

def grab(url, t, dest):
    r = subprocess.run(
        ['ffmpeg','-hide_banner','-loglevel','error','-ss',str(t),'-i',url,
         '-frames:v','1','-q:v','3','-vf','scale=960:-2','-y',dest],
        capture_output=True, text=True, timeout=180)
    return r.returncode == 0 and os.path.exists(dest) and os.path.getsize(dest) > 2000

def main():
    jobs = json.load(open(sys.argv[1]))   # [{vid, t, name}]
    cache, done, failed = {}, [], []
    by_vid = {}
    for j in jobs: by_vid.setdefault(j['vid'], []).append(j)

    for vid, js in by_vid.items():
        # Skip work if every frame for this video already exists.
        if all(os.path.exists(f"{OUT}/{j['name']}.jpg") for j in js):
            done += [j['name'] for j in js]
            print(f"  {vid}: cached"); continue
        url = cache.get(vid) or stream_url(vid)
        if not url:
            print(f"  {vid}: NO STREAM"); failed += [j['name'] for j in js]; continue
        cache[vid] = url
        ok = 0
        for j in js:
            dest = f"{OUT}/{j['name']}.jpg"
            if os.path.exists(dest): ok += 1; done.append(j['name']); continue
            if grab(url, j['t'], dest): ok += 1; done.append(j['name'])
            else: failed.append(j['name'])
        print(f"  {vid}: {ok}/{len(js)} frames")

    print(f"\n{len(done)} frames OK, {len(failed)} failed")
    json.dump({'ok':done,'failed':failed}, open(ROOT / 'data/frames-report.json','w'), indent=1)

if __name__ == '__main__':
    main()
