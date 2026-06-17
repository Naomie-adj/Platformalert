# Procédure de sauvegarde PostgreSQL

## Backup manuel

```bash
bash scripts/backup.sh
```

## Automatisation via cron (sur l'EC2 privé)

Ajouter une tâche cron quotidienne à 3h du matin :

```bash
crontab -e
```

Ajouter la ligne :
0 3 * * * /opt/platformalert/scripts/backup.sh >> /var/log/platformalert-backup.log 2>&1

## Restauration

```bash
gunzip -c backups/platformalert_2026-05-20_03-00-00.sql.gz | \
docker exec -i platformalert_db psql -U $POSTGRES_USER $POSTGRES_DB
```

## Politique de rétention

- Backups conservés 30 jours en local sur l'EC2 privé
- **Amélioration future** : upload automatique vers S3 + lifecycle policy 
  pour une rétention longue durée et une résilience en cas de perte de l'EC2
