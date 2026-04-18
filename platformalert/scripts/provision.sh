#!/bin/bash
# ============================================
# provision.sh — Installation de l'environnement
# PlatformAlert — Naomie Adjovi
# ============================================

set -e  # Arrêter en cas d'erreur

# ── Couleurs ──────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()     { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Vérification root ─────────────────────────
if [ "$EUID" -ne 0 ]; then
  error "Ce script doit être exécuté en tant que root (sudo)"
fi

log "Démarrage du provisionnement PlatformAlert..."

# ── Mise à jour système ───────────────────────
log "Mise à jour des paquets système..."
apt-get update -y && apt-get upgrade -y

# ── Installation des dépendances ─────────────
log "Installation des dépendances..."
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  software-properties-common \
  git \
  unzip

# ── Installation Docker ───────────────────────
if command -v docker &> /dev/null; then
  warn "Docker est déjà installé — version : $(docker --version)"
else
  log "Installation de Docker..."
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  log "Docker installé avec succès ✅"
fi

# ── Démarrage Docker ──────────────────────────
log "Démarrage du service Docker..."
systemctl start docker
systemctl enable docker

# ── Ajout utilisateur au groupe docker ────────
if [ -n "$SUDO_USER" ]; then
  log "Ajout de $SUDO_USER au groupe docker..."
  usermod -aG docker "$SUDO_USER"
  warn "Déconnectez-vous et reconnectez-vous pour appliquer les changements"
fi

# ── Vérification finale ───────────────────────
log "Vérification de l'installation..."
docker --version && log "Docker OK ✅" || error "Docker KO ❌"
docker compose version && log "Docker Compose OK ✅" || error "Docker Compose KO ❌"

log "============================================"
log "Provisionnement terminé avec succès ! 🚀"
log "============================================"
