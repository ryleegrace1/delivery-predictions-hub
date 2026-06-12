#!/usr/bin/env bash
# Refresh data/projects.json from Vault.
#
# Reads the list of Vault project IDs from the existing projects.json,
# re-fetches each via the mana CLI, and updates phase + status in place.
# The bet → outcome mapping is preserved (edit projects.json manually to add/remove outcomes).

set -euo pipefail
cd "$(dirname "$0")/.."

DATA=data/projects.json
TMP=$(mktemp)

if ! command -v mana >/dev/null 2>&1; then
  echo "Error: mana CLI not found. Install or PATH-fix first." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq not found. brew install jq" >&2
  exit 1
fi

echo "Reading project IDs from $DATA…"
IDS=$(jq -r '[.projects[].vaultId, .paused[].vaultId] | map(select(. != null)) | unique | .[]' "$DATA")

declare -A PHASE
declare -A STATUS

for ID in $IDS; do
  echo "  Fetching #$ID from Vault…"
  RAW=$(mana tool vault-get-project --project_id "$ID" 2>/dev/null || true)
  if [[ -z "$RAW" ]]; then
    echo "  ⚠️  No data for #$ID, skipping"
    continue
  fi
  # Parse phase (lowercase) and status from the markdown output
  PH=$(echo "$RAW" | grep -E '^\*\*Phase\*\*' | sed -E 's/.*: ([A-Za-z]+).*/\1/' | tr '[:upper:]' '[:lower:]')
  ST=$(echo "$RAW" | grep -E '^\*\*Status\*\*' | sed -E 's/.*: ([a-z_]+).*/\1/')
  PHASE[$ID]="$PH"
  STATUS[$ID]="$ST"
done

# Build jq updates
JQ_FILTER='.'
for ID in "${!PHASE[@]}"; do
  JQ_FILTER+=" | (.projects[] | select(.vaultId == $ID) | .phase) = \"${PHASE[$ID]}\""
  JQ_FILTER+=" | (.projects[] | select(.vaultId == $ID) | .status) = \"${STATUS[$ID]}\""
done

TODAY=$(date +%Y-%m-%d)
JQ_FILTER+=" | .lastUpdated = \"$TODAY\""

jq "$JQ_FILTER" "$DATA" > "$TMP" && mv "$TMP" "$DATA"

echo "✓ Updated $DATA (lastUpdated=$TODAY)"
echo "Next: git add data/projects.json && git commit -m \"Refresh $TODAY\" && git push"
echo "      quick deploy"
