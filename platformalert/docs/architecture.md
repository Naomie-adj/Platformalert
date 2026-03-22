# Architecture PlatformAlert

## Cloud provider
AWS Free Tier — région eu-west-3 (Paris)

## Réseau
- VPC : 10.0.0.0/16
- Subnet public (10.0.1.0/24) : Nginx — reverse proxy, ports 80/443
- Subnet privé (10.0.2.0/24) : Flask API, Scraper, PostgreSQL, Prometheus

## Composants
- **Nginx** : point d'entrée, redirige vers Flask
- **Flask API** : gestion des produits surveillés
- **Scraper Python** : vérifie les prix toutes les heures (cron)
- **PostgreSQL** : stockage historique des prix
- **Prometheus + Grafana** : monitoring et alertes
- **GitHub Actions** : CI/CD — test → scan → build → deploy

## Sécurité
- PostgreSQL uniquement accessible depuis le subnet privé
- SSH uniquement depuis GitHub Actions (clé déployée en secret)
- Secrets gérés via variables d'environnement (.env exclu de Git)

## Schéma
Voir schema.png
