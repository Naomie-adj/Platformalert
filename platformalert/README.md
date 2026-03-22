# PlatformAlert

Application de surveillance automatisée de prix e-commerce.
Un scraper Python vérifie toutes les heures les prix sur Amazon/Fnac,
stocke l'historique en PostgreSQL et envoie une alerte email quand
un prix passe sous un seuil défini.

## Stack technique
- Cloud : AWS (Free Tier) — EC2 + VPC
- Conteneurisation : Docker + Docker Compose
- IaC Provisionnement : Terraform
- IaC Configuration : Ansible
- CI/CD : GitHub Actions
- Monitoring : Prometheus + Grafana
- Application : Python (scraper) + Flask (API) + PostgreSQL

## Architecture
Voir docs/architecture.md et docs/schema.png
