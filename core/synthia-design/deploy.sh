#!/usr/bin/env bash
# Cynthia Studio OS — Hostinger VPS Deploy Script
# Usage: ./deploy.sh [--env prod|staging]
set -euo pipefail

# ── Config (override via env or .env file) ────────────────────────────────────
VPS_HOST="${VPS_HOST:-YOUR_VPS_IP}"
VPS_USER="${VPS_USER:-root}"
DOMAIN="${DOMAIN:-yourdomain.com}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/cynthia}"
BRANCH="${BRANCH:-main}"
GITHUB_REPO="${GITHUB_REPO:-executiveusa/synthia-superdesign}"

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

log()  { echo -e "${BOLD}[deploy]${RESET} $*"; }
ok()   { echo -e "${GREEN}✓${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠${RESET} $*"; }
fail() { echo -e "${RED}✗${RESET} $*"; exit 1; }

# ── Pre-flight checks ─────────────────────────────────────────────────────────

log "Pre-flight checks..."

[[ -z "${ANTHROPIC_API_KEY:-}" ]] && fail "ANTHROPIC_API_KEY is required"
[[ -z "${CYNTHIA_API_KEY:-}"   ]] && fail "CYNTHIA_API_KEY is required (run: openssl rand -hex 32)"
[[ "$VPS_HOST" == "YOUR_VPS_IP" ]] && fail "Set VPS_HOST to your Hostinger VPS IP"

command -v ssh  >/dev/null || fail "ssh not found"
command -v scp  >/dev/null || fail "scp not found"

ok "Pre-flight passed"

# ── Deploy files ──────────────────────────────────────────────────────────────

log "Connecting to ${VPS_USER}@${VPS_HOST}..."

ssh "${VPS_USER}@${VPS_HOST}" "
  set -e
  apt-get update -qq
  # Install Docker if missing
  if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    echo 'Docker installed'
  fi
  # Install git if missing
  command -v git &>/dev/null || apt-get install -y -qq git
  mkdir -p ${DEPLOY_DIR}
"

log "Syncing repository..."
ssh "${VPS_USER}@${VPS_HOST}" "
  set -e
  if [ -d '${DEPLOY_DIR}/.git' ]; then
    cd ${DEPLOY_DIR}
    git fetch origin ${BRANCH}
    git reset --hard origin/${BRANCH}
  else
    git clone --branch ${BRANCH} https://github.com/${GITHUB_REPO}.git ${DEPLOY_DIR}
    cd ${DEPLOY_DIR}
  fi
"

log "Writing environment..."
ssh "${VPS_USER}@${VPS_HOST}" "cat > ${DEPLOY_DIR}/.env << 'ENVEOF'
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
CYNTHIA_API_KEY=${CYNTHIA_API_KEY}
GITHUB_TOKEN=${GITHUB_TOKEN:-}
ANTHROPIC_MODEL=${ANTHROPIC_MODEL:-claude-opus-4-7}
DOMAIN=${DOMAIN}
SSL_EMAIL=${SSL_EMAIL:-admin@${DOMAIN}}
VPS_HOST=${VPS_HOST}
ENVEOF"

# ── SSL setup (first deploy only) ─────────────────────────────────────────────

SSL_EXISTS=$(ssh "${VPS_USER}@${VPS_HOST}" "test -d /etc/letsencrypt/live/${DOMAIN} && echo 'yes' || echo 'no'")

if [[ "$SSL_EXISTS" == "no" ]]; then
  warn "SSL certificate not found — running certbot..."
  ssh "${VPS_USER}@${VPS_HOST}" "
    cd ${DEPLOY_DIR}
    # Start nginx on port 80 with HTTP-only config for ACME challenge
    docker compose --profile ssl run --rm certbot
  "
  ok "SSL certificate obtained"
fi

# ── Start / update services ───────────────────────────────────────────────────

log "Building and starting containers..."
ssh "${VPS_USER}@${VPS_HOST}" "
  cd ${DEPLOY_DIR}
  docker compose pull --ignore-pull-failures 2>/dev/null || true
  docker compose build --no-cache
  docker compose up -d --remove-orphans
"

# ── Health check ──────────────────────────────────────────────────────────────

log "Waiting for services to start..."
sleep 15

HEALTH=$(ssh "${VPS_USER}@${VPS_HOST}" "curl -sf https://${DOMAIN}/api/health | head -c 200 || echo 'FAILED'")

if [[ "$HEALTH" == *'"status":"ok"'* ]] || [[ "$HEALTH" == *'"status": "ok"'* ]]; then
  ok "Cynthia Studio OS is live!"
  echo ""
  echo -e "  ${BOLD}Dashboard:${RESET}  https://${DOMAIN}/dashboard"
  echo -e "  ${BOLD}API:${RESET}        https://${DOMAIN}/api/v1/"
  echo -e "  ${BOLD}API Docs:${RESET}   https://${DOMAIN}/api/docs"
  echo -e "  ${BOLD}MCP SSE:${RESET}    https://${DOMAIN}/mcp/sse"
  echo -e "  ${BOLD}Health:${RESET}     https://${DOMAIN}/api/health"
  echo ""
else
  warn "Health check inconclusive — check logs:"
  echo "  ssh ${VPS_USER}@${VPS_HOST} 'cd ${DEPLOY_DIR} && docker compose logs --tail=50'"
fi
