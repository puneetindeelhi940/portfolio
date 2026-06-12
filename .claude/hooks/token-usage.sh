#!/usr/bin/env bash
# token-usage.sh — Claude Code Stop hook.
# After every turn, reports token usage for this session, today, and the
# last 7 days, by aggregating the local transcript files. Optional budgets
# via env vars show "tokens left":
#   CLAUDE_TOKEN_BUDGET_SESSION / CLAUDE_TOKEN_BUDGET_DAY / CLAUDE_TOKEN_BUDGET_WEEK
#
# Honest limits: Anthropic does not expose your plan's remaining quota to
# hooks (the CLI's /usage screen is the authority), and day/week totals only
# include transcripts present on THIS machine.

set -uo pipefail

input=$(cat 2>/dev/null || true)
tp=$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)
[ -n "$tp" ] && [ -f "$tp" ] || exit 0

projects_root=$(dirname "$(dirname "$tp")")
day_start=$(date -d "00:00" +%s 2>/dev/null || date -v0H -v0M -v0S +%s)
week_start=$((day_start - ($(date +%u) - 1) * 86400))

# Sum usage across files, deduping repeated lines per message id and
# filtering by timestamp. Prints "input_tokens output_tokens".
sum_usage() {
  local since=$1; shift
  jq -nr --argjson since "$since" '
    [inputs
     | select(type == "object" and (.message.usage? != null))
     | {id: (.message.id // .uuid // "?"),
        ts: ((.timestamp // "") | sub("\\.[0-9]+Z$"; "Z") | (fromdateiso8601? // 0)),
        u: .message.usage}]
    | group_by(.id) | map(last)
    | map(select(.ts >= $since))
    | {i: (map(.u | (.input_tokens // 0) + (.cache_creation_input_tokens // 0)
                  + (.cache_read_input_tokens // 0)) | add // 0),
       o: (map(.u.output_tokens // 0) | add // 0)}
    | "\(.i) \(.o)"
  ' "$@" 2>/dev/null || echo "0 0"
}

read -r s_in s_out <<<"$(sum_usage 0 "$tp")"

all_files=()
while IFS= read -r f; do all_files+=("$f"); done \
  < <(find "$projects_root" -name '*.jsonl' -newermt "@$week_start" 2>/dev/null)

if [ ${#all_files[@]} -gt 0 ]; then
  read -r d_in d_out <<<"$(sum_usage "$day_start" "${all_files[@]}")"
  read -r w_in w_out <<<"$(sum_usage "$week_start" "${all_files[@]}")"
else
  d_in=0; d_out=0; w_in=0; w_out=0
fi

fmt() { printf '%s' "$1" | sed -E ':a;s/([0-9])([0-9]{3})(,|$)/\1,\2\3/;ta'; }

left() { # $1 = used, $2 = budget env value
  if [ -n "${2:-}" ] && [ "${2:-0}" -gt 0 ] 2>/dev/null; then
    local r=$(($2 - $1)); [ $r -lt 0 ] && r=0
    printf '%s left' "$(fmt $r)"
  else
    printf 'left: n/a'
  fi
}

s_tot=$((s_in + s_out)); d_tot=$((d_in + d_out)); w_tot=$((w_in + w_out))
msg="TOKEN USAGE
Session:   $(fmt $s_tot) used (in $(fmt $s_in) / out $(fmt $s_out)) · $(left $s_tot "${CLAUDE_TOKEN_BUDGET_SESSION:-}")
Today:     $(fmt $d_tot) used (in $(fmt $d_in) / out $(fmt $d_out)) · $(left $d_tot "${CLAUDE_TOKEN_BUDGET_DAY:-}")
This week: $(fmt $w_tot) used (in $(fmt $w_in) / out $(fmt $w_out)) · $(left $w_tot "${CLAUDE_TOKEN_BUDGET_WEEK:-}")
(in = prompt+cache tokens · plan limits not exposed to hooks — see /usage; day/week cover transcripts on this machine)"

jq -n --arg m "$msg" '{systemMessage: $m, suppressOutput: true}'
exit 0
