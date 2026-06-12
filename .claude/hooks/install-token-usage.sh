#!/usr/bin/env bash
# Installs the token-usage Stop hook globally — every repo, every session,
# on the machine where it runs. Usable two ways:
#   from a clone:  bash .claude/hooks/install-token-usage.sh
#   from anywhere: curl -fsSL https://raw.githubusercontent.com/puneetindeelhi940/portfolio/main/.claude/hooks/install-token-usage.sh | bash
# Idempotent: re-running refreshes the script and never duplicates the hook.
set -euo pipefail

RAW_URL="https://raw.githubusercontent.com/puneetindeelhi940/portfolio/main/.claude/hooks/token-usage.sh"
dest_dir="$HOME/.claude/hooks"
settings="$HOME/.claude/settings.json"
cmd="$dest_dir/token-usage.sh"

command -v jq >/dev/null || { echo "ERROR: jq is required" >&2; exit 1; }

mkdir -p "$dest_dir"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-/}")" 2>/dev/null && pwd || true)"
if [ -n "$script_dir" ] && [ -f "$script_dir/token-usage.sh" ]; then
  cp "$script_dir/token-usage.sh" "$cmd"
else
  curl -fsSL "$RAW_URL" -o "$cmd"
fi
chmod +x "$cmd"

[ -s "$settings" ] || echo '{}' > "$settings"

if jq -e --arg c "$cmd" \
    '.hooks.Stop[]?.hooks[]? | select(.command == $c)' "$settings" >/dev/null; then
  echo "Hook already registered in $settings — script refreshed."
else
  tmp=$(mktemp)
  jq --arg c "$cmd" '.hooks.Stop = ((.hooks.Stop // []) + [{
      hooks: [{type: "command", command: $c, timeout: 30,
               statusMessage: "Tallying token usage…"}]
    }])' "$settings" > "$tmp"
  mv "$tmp" "$settings"
  echo "Registered Stop hook in $settings"
fi

echo "Installed: $cmd"
echo "Takes effect in new sessions (or open /hooks once in a running one)."
