/**
 * Spawn API — Clone a Cynthia agent and send it to a team member
 *
 * POST /api/spawn
 * Generates a spawn package (soul file + docker-compose + deploy script)
 * and returns a shareable configuration for the receiving team.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface SpawnRequest {
  agentName: string
  agentClass: string
  role: string
  scope: string
  teamLead: string
  teamChannel?: string
  teamEmail: string
  githubOrg?: string
  domain?: string
  vpsHost?: string
  mission: string
  skills: string[]
  model?: string
}

function generateAgentId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function buildSoulFile(req: SpawnRequest, agentId: string): string {
  const ts = new Date().toISOString()
  const skillsChecked = [
    '- [x] emerald-tablets-SKILL.md  (always included)',
    '- [x] DESIGN_LAWS.md            (always included)',
    ...req.skills.map(s => `- [x] ${s}`),
  ].join('\n')

  return `# SOUL FILE — ${req.agentName || `CYNTHIA-${agentId}`}
# Generated: ${ts}
# Status: CONFIGURED — ready for deploy
# Agent ID: ${agentId}

---

## SECTION 1 — THE EMERALD TABLETS (Permanent. Not Optional.)

### TABLET I — THE ANTI-HYPE COVENANT
> "The map is not the territory. The framework is not the product."
Build things that work, not things that sound impressive. Simplicity always wins.

### TABLET II — QUALITY IS A FLOOR, NOT A CEILING
> "8.5 is where we start. Not where we aim."
UDEC 8.5 minimum. Zero stubs. Zero TODOs. If it ships, it is complete.

### TABLET III — TASTE IS A DISCIPLINE
> "Taste is not a feeling. It is a practice."
Never call something beautiful without saying exactly why.

### TABLET IV — SINGLE RESPONSIBILITY IS NON-NEGOTIABLE
> "Eight agents who each do one thing perfectly beat one agent that does everything poorly."
Stay in scope. Do your one job with full craft.

### TABLET V — THE LOOP IS THE ONLY LOOP
> "Build × 3 → Score → Gate → Brief → Repeat. No shortcuts."
Run the full loop. No skipping review.

### TABLET VI — THE REPOSITORY IS THE PRODUCT
> "If it lives only in a chat window, it doesn't exist."
Everything built must be committed. Named. Permanent.

### TABLET VII — SERVE PEOPLE, NOT AESTHETICS
> "We build technology in service of places and people, not in service of aesthetics."
Specificity over generality. Community over exoticism.

---

## SECTION 2 — BASIC OPERATING INSTRUCTIONS

- UDEC floor: 8.5 composite | MOT min: 7.0 | ACC min: 7.0
- Memory is append-only. No agent modifies another's memory.
- Financial actions always require human approval.
- No purple. No banned fonts. No scroll listeners. Always respect prefers-reduced-motion.
- Route: intake → classify → build × 3 → review → gate → deliver

---

## SECTION 4 — AGENT IDENTITY

\`\`\`yaml
agent_name: "${req.agentName || `CYNTHIA-${agentId}`}"
agent_id: "${agentId}"
agent_class: "${req.agentClass || 'custom'}"
primary_role: "${req.role}"
scope: "${req.scope}"
spawned_from: "Cynthia Design Studio (executiveusa/synthia-superdesign)"
spawned_at: "${ts}"
spawned_by: "Studio OS Spawn System"
team: "${req.teamLead}"
\`\`\`

---

## SECTION 5 — MISSION CONTEXT

\`\`\`
MISSION: ${req.mission}
SERVES:  ${req.teamLead}
TEAM_CHANNEL: ${req.teamChannel || 'not configured'}
TEAM_EMAIL: ${req.teamEmail}
\`\`\`

---

## SECTION 6 — SKILLS REGISTRY

${skillsChecked}

---

## SECTION 7 — TEAM CONFIGURATION

\`\`\`yaml
team_lead: "${req.teamLead}"
team_email: "${req.teamEmail}"
team_channel: "${req.teamChannel || ''}"
github_org: "${req.githubOrg || ''}"
dashboard_url: "https://${req.domain || `${agentId.toLowerCase()}.yourdomain.com`}"
api_endpoint: "https://${req.domain || `${agentId.toLowerCase()}.yourdomain.com`}/api"
mcp_endpoint: "https://${req.domain || `${agentId.toLowerCase()}.yourdomain.com`}/mcp"
\`\`\`

---

## SECTION 8 — DEPLOYMENT CONFIGURATION

\`\`\`yaml
deployment_target: "hostinger-vps"
domain: "${req.domain || ''}"
vps_host: "${req.vpsHost || ''}"
docker_registry: "ghcr.io/${req.githubOrg || 'yourorg'}"
anthropic_model: "${req.model || 'claude-opus-4-7'}"
agent_id: "${agentId}"
\`\`\`
`
}

function buildDockerCompose(req: SpawnRequest, agentId: string): string {
  const name = (req.agentName || `cynthia-${agentId}`).toLowerCase().replace(/[^a-z0-9-]/g, '-')
  return `version: '3.9'

services:
  web:
    image: ghcr.io/${req.githubOrg || 'yourorg'}/cynthia-agent:latest
    container_name: ${name}-web
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - GITHUB_TOKEN=\${GITHUB_TOKEN}
      - CYNTHIA_API_KEY=\${CYNTHIA_API_KEY}
      - CYNTHIA_AGENT_ID=${agentId}
      - CYNTHIA_AGENT_NAME=${req.agentName || `CYNTHIA-${agentId}`}
      - NODE_ENV=production
    volumes:
      - ./soul.md:/app/soul.md:ro
      - agent_data:/app/data
    expose:
      - "3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - agent_net

  api:
    image: ghcr.io/${req.githubOrg || 'yourorg'}/cynthia-fastapi:latest
    container_name: ${name}-api
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
      - CYNTHIA_API_KEY=\${CYNTHIA_API_KEY}
      - CYNTHIA_AGENT_ID=${agentId}
      - DASHBOARD_URL=http://web:3001
    expose:
      - "8000"
    networks:
      - agent_net
    depends_on:
      web:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    container_name: ${name}-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot_etc:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot:ro
    depends_on:
      - web
      - api
    networks:
      - agent_net

  certbot:
    image: certbot/certbot
    container_name: ${name}-certbot
    volumes:
      - certbot_etc:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --email \${SSL_EMAIL} -d ${req.domain || 'yourdomain.com'} --agree-tos --non-interactive

volumes:
  agent_data:
  certbot_etc:
  certbot_www:

networks:
  agent_net:
    driver: bridge
`
}

function buildDeployScript(req: SpawnRequest, agentId: string): string {
  const name = (req.agentName || `cynthia-${agentId}`).toLowerCase().replace(/[^a-z0-9-]/g, '-')
  return `#!/bin/bash
# Cynthia Agent Deploy Script
# Agent: ${req.agentName || `CYNTHIA-${agentId}`} (${agentId})
# Generated: ${new Date().toISOString()}
set -euo pipefail

AGENT_ID="${agentId}"
AGENT_NAME="${req.agentName || `CYNTHIA-${agentId}`}"
VPS_HOST="${req.vpsHost || 'YOUR_VPS_IP'}"
VPS_USER="root"
DOMAIN="${req.domain || 'yourdomain.com'}"
DEPLOY_DIR="/opt/cynthia-agents/${agentId}"

echo "🚀 Deploying \${AGENT_NAME} (\${AGENT_ID}) to \${VPS_HOST}..."

# 1. Check required env vars
: "\${ANTHROPIC_API_KEY:?ANTHROPIC_API_KEY is required}"
: "\${CYNTHIA_API_KEY:?CYNTHIA_API_KEY is required}"

# 2. SCP deploy files to VPS
echo "📦 Copying deploy files..."
ssh "\${VPS_USER}@\${VPS_HOST}" "mkdir -p \${DEPLOY_DIR}"
scp docker-compose.yml "\${VPS_USER}@\${VPS_HOST}:\${DEPLOY_DIR}/"
scp nginx.conf "\${VPS_USER}@\${VPS_HOST}:\${DEPLOY_DIR}/"
scp soul.md "\${VPS_USER}@\${VPS_HOST}:\${DEPLOY_DIR}/"

# 3. Write .env on VPS
echo "🔐 Writing environment..."
ssh "\${VPS_USER}@\${VPS_HOST}" "cat > \${DEPLOY_DIR}/.env << 'ENVEOF'
ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
CYNTHIA_API_KEY=\${CYNTHIA_API_KEY}
GITHUB_TOKEN=\${GITHUB_TOKEN:-}
SSL_EMAIL=\${SSL_EMAIL:-admin@\${DOMAIN}}
ENVEOF"

# 4. Pull images and start
echo "🐳 Starting containers..."
ssh "\${VPS_USER}@\${VPS_HOST}" "cd \${DEPLOY_DIR} && docker compose pull && docker compose up -d"

# 5. Health check
echo "🏥 Checking health..."
sleep 10
if curl -sf "https://\${DOMAIN}/api/health" > /dev/null; then
  echo "✅ \${AGENT_NAME} is live at https://\${DOMAIN}"
  echo "   Dashboard: https://\${DOMAIN}/dashboard"
  echo "   API:       https://\${DOMAIN}/api"
  echo "   MCP:       https://\${DOMAIN}/mcp"
else
  echo "⚠️  Health check failed — check: ssh \${VPS_USER}@\${VPS_HOST} 'cd \${DEPLOY_DIR} && docker compose logs'"
fi
`
}

export async function POST(req: NextRequest) {
  let body: SpawnRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { agentName, role, teamEmail, mission } = body
  if (!role || !teamEmail || !mission) {
    return NextResponse.json({ error: 'role, teamEmail, and mission are required' }, { status: 400 })
  }

  const agentId = generateAgentId()
  const finalName = agentName || `CYNTHIA-${agentId}`

  const soulFile = buildSoulFile(body, agentId)
  const dockerCompose = buildDockerCompose(body, agentId)
  const deployScript = buildDeployScript(body, agentId)

  // Build setup instructions
  const setupInstructions = `# ${finalName} — Setup Instructions

Agent ID: ${agentId}
Spawned: ${new Date().toISOString()}

## Quick Start

1. Download the spawn package files
2. Edit soul.md — complete Section 4 (if not already filled)
3. Set environment variables:
   \`\`\`bash
   export ANTHROPIC_API_KEY=sk-ant-...
   export CYNTHIA_API_KEY=$(openssl rand -hex 32)
   export SSL_EMAIL=your@email.com
   \`\`\`
4. Run the deploy script:
   \`\`\`bash
   chmod +x deploy.sh && ./deploy.sh
   \`\`\`

## Endpoints (once deployed)

- Dashboard: https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/dashboard
- API docs:  https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/api/docs
- MCP:       https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/mcp/sse
- Health:    https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/api/health

## API Auth

All API calls require header: \`Authorization: Bearer $CYNTHIA_API_KEY\`

## Calling the Agent

\`\`\`bash
curl -X POST https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/api/v1/command \\
  -H "Authorization: Bearer YOUR_CYNTHIA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Audit this landing page: https://example.com"}'
\`\`\`
`

  return NextResponse.json({
    agentId,
    agentName: finalName,
    spawnedAt: new Date().toISOString(),
    teamEmail,
    files: {
      'soul.md': soulFile,
      'docker-compose.yml': dockerCompose,
      'deploy.sh': deployScript,
      'SETUP.md': setupInstructions,
    },
    endpoints: {
      dashboard: `https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/dashboard`,
      api: `https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/api`,
      mcp: `https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/mcp`,
      health: `https://${body.domain || `${agentId.toLowerCase()}.yourdomain.com`}/api/health`,
    },
  }, { status: 201 })
}
