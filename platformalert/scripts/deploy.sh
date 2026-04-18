#!/bin/bash
# ============================================
# deploy.sh — Déploiement de PlatformAlert
# PlatformAlert — Naomie Adjovi
# ============================================

set -e

# ── Couleurs ──────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()     { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Variables ─────────────────────────────────
APP_DIR="/opt/platformalert"
ENV_FILE="$APP_DIR/.env"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"

# ── Vérifications ─────────────────────────────
log "Vérification de l'environnement..."

[ -f "$COMPOSE_FILE" ] || error "docker-compose.yml introuvable dans $APP_DIR"
[ -f "$ENV_FILE" ]     || error ".env introuvable dans $APP_DIR"

command -v docker &> /dev/null || error "Docker n'est pas installé — lancez provision.sh d'abord"

# ── Pull des images ───────────────────────────
log "Pull des images Docker..."
cd "$APP_DIR"
docker compose --env-file .env pull

# ── Arrêt des conteneurs existants ────────────
log "Arrêt des conteneurs existants..."
docker compose --env-file .env down || warn "Aucun conteneur en cours"

# ── Lancement de l'application ────────────────
log "Lancement de PlatformAlert..."
docker compose --env-file .env up -d

# ── Vérification des conteneurs ───────────────
log "Vérification des conteneurs..."
sleep 5
docker compose ps

# ── Résultat ──────────────────────────────────
RUNNING=$(docker compose ps --status running | grep -c "running" || true)
log "====================================
