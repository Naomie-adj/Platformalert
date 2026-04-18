#!/bin/bash
# ============================================
# monitor.sh — Supervision de PlatformAlert
# PlatformAlert — Naomie Adjovi
# ============================================

# ── Couleurs ──────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()     { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }
title()   { echo -e "${BLUE}═══════════════════════════════════${NC}"; echo -e "${BLUE} $1${NC}"; echo -e "${BLUE}═══════════════════════════════════${NC}"; }

# ── État des conteneurs ───────────────────────
title "État des conteneurs Docker"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || error "Docker non disponible"

# ── Vérification API ──────────────────────────
title "Vérification API PlatformAlert"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ]; then
  log "API OK ✅ (HTTP $API_STATUS)"
else
  error "API KO ❌ (HTTP $API_STATUS)"
fi

# ── Vérification Prometheus ───────────────────
title "Vérification Prometheus"
PROM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/-/healthy 2>/dev/null || echo "000")
if [ "$PROM_STATUS" = "200" ]; then
  log "Prometheus OK ✅ (HTTP $PROM_STATUS)"
else
  error "Prometheus KO ❌ (HTTP $PROM_STATUS)"
fi

# ── Vérification Grafana ──────────────────────
title "Vérification Grafana"
GRAFANA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$GRAFANA_STATUS" = "200" ]; then
  log "Grafana OK ✅ (HTTP $GRAFANA_STATUS)"
else
  error "Grafana KO ❌ (HTTP $GRAFANA_STATUS)"
fi

# ── Utilisation des ressources ────────────────
title "Utilisation des ressources"
echo -e "${YELLOW}CPU et Mémoire par conteneur :${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null

# ── Espace disque ─────────────────────────────
title "Espace disque"
df -h / | awk 'NR==2 {
  usage=$5+0
  if (usage > 80) print "\033[0;31m[WARN] Disque à " usage "% — seuil critique !\033[0m"
  else print "\033[0;32m[OK] Disque à " usage "%\033[0m"
}'

# ── Logs récents ──────────────────────────────
title "Derniers logs API (10 lignes)"
docker logs platformaler
