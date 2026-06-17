#!/bin/bash
# ============================================
# backup.sh — Sauvegarde PostgreSQL
# PlatformAlert — Naomie Adjovi
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log()   { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Variables ─────────────────────────────────
BACKUP_DIR="/opt/platformalert/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
BACKUP_FILE="$BACKUP_DIR/platformalert_$TIMESTAMP.sql.gz"
CONTAINER_NAME="platformalert_db"

# ── Charger les variables d'environnement ─────
if [ -f /opt/platformalert/.env ]; then
  export $(grep -v '^#' /opt/platformalert/.env | xargs)
else
  error "Fichier .env introuvable"
fi

# ── Créer le dossier de backup ────────────────
mkdir -p "$BACKUP_DIR"

# ── Vérifier que le conteneur tourne ──────────
if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
  error "Le conteneur $CONTAINER_NAME n'est pas en cours d'exécution"
fi

# ── Exécuter le dump ───────────────────────────
log "Démarrage du backup PostgreSQL..."
docker exec "$CONTAINER_NAME" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"

if [ -s "$BACKUP_FILE" ]; then
  log "Backup créé : $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  error "Le fichier de backup est vide — échec du dump"
fi

# ── Nettoyage des anciens backups ─────────────
log "Suppression des backups de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "platformalert_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# ── Résumé ──────────────────────────────────────
COUNT=$(find "$BACKUP_DIR" -name "platformalert_*.sql.gz" | wc -l)
log "============================================"
log "Backup terminé. $COUNT backup(s) conservé(s)."
log "============================================"
