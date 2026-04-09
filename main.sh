#!/bin/bash
source "$(dirname "$0")/lib.sh"

ENV="${1:-dev}"
validate_env "$ENV" || exit 1

for cmd in docker terraform ansible jq; do
  check_command "$cmd" || exit 1
done

log_info "Environnement: $ENV"
log_info "Tous les outils OK"

SERVEURS=("web-1" "web-2" "db-1")
log_info "${#SERVEURS[@]} serveurs a deployer"
for srv in "${SERVEURS[@]}"; do
  log_info "Deploiement: $srv"
done
