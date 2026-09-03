#!/usr/bin/env bash
# Pull English captions (manual preferred, auto as fallback) without downloading video.
# Usage: pipeline/fetch_captions.sh [urls-file]
#        default urls-file is data/urls.txt (one YouTube URL or id per line)
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
BATCH="${1:-data/urls.txt}"

if [[ ! -f "$BATCH" ]]; then
  echo "no url list at $BATCH — write one, or generate it from a search sweep:" >&2
  echo "  jq -r '.results[].url' data/shortlist.json > data/urls.txt" >&2
  exit 1
fi

uv run yt-dlp \
  --batch-file "$BATCH" \
  --skip-download \
  --write-subs --write-auto-subs \
  --sub-langs "en.*" --sub-format "vtt" \
  --write-info-json \
  --paths captions \
  --output "%(id)s.%(ext)s" \
  --ignore-errors --no-warnings \
  --sleep-requests 1 \
  2>&1 | tail -60

echo "captions on disk: $(ls captions/*.vtt 2>/dev/null | wc -l)"
