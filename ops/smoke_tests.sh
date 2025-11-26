#!/usr/bin/env bash
# Simple smoke tests for staging/production. Requires curl.

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-}" # set in env if required

echo "Testing /healthz"
curl -fsS --max-time 10 "$BASE_URL/healthz" | jq '.' || { echo '/healthz failed'; exit 2; }

echo "Testing GET /api/activos (first page)"
curl -fsS -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/api/activos" | jq '.[0]' || echo 'GET /api/activos may require auth or returned empty'

echo "Testing POST create activo (dry-run if API supports)"
cat <<EOF > /tmp/sample_activo.json
{
  "nombre": "TEST-Act-01",
  "categoria": "Test",
  "especificaciones": {"prueba": "valor"}
}
EOF

# If the API requires authentication supply AUTH_TOKEN env var before running.
if [ -n "$AUTH_TOKEN" ]; then
  curl -fsS -H "Content-Type: application/json" -H "Authorization: Bearer $AUTH_TOKEN" -d @/tmp/sample_activo.json "$BASE_URL/api/activos" | jq '.' || echo 'POST /api/activos failed or returned non-JSON'
else
  echo "Skipping POST /api/activos because AUTH_TOKEN not set"
fi

echo "Smoke tests completed. Review responses for errors."
