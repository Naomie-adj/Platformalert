# Cahier des Charges — PlatformAlert
**Auteur** : Naomie ADJOVI  
**Date** : Avril 2026  
**Version** : 1.0  
**Formation** : Titre Professionnel Administrateur Systèmes DevOps  

---

## 1. Contexte et problématique

### 1.1 Contexte
Les plateformes e-commerce comme Amazon et la Fnac pratiquent une politique 
de prix dynamique : les tarifs varient plusieurs fois par jour en fonction 
de la demande, des stocks et des promotions. Un consommateur qui souhaite 
acheter un produit au meilleur prix doit donc surveiller manuellement et 
régulièrement ces variations — une tâche fastidieuse et chronophage.

### 1.2 Problématique
Comment permettre à un particulier de surveiller automatiquement l'évolution 
des prix de produits e-commerce et d'être alerté en temps réel lorsqu'une 
opportunité d'achat se présente ?

### 1.3 Alternatives existantes et leurs limites

| Outil | Limites |
|---|---|
| CamelCamelCamel | Limité à Amazon uniquement |
| Keepa | Fonctionnalités avancées payantes |
| Alertes manuelles | Chronophage, pas d'historique centralisé |

PlatformAlert se distingue par son architecture **open source**, 
**auto-hébergée** et **multi-plateformes**, offrant un contrôle total 
sur les données et sans coût d'abonnement.

---

## 2. Présentation du projet

PlatformAlert est une application de surveillance automatique de prix 
e-commerce. Elle scrape périodiquement les prix de produits sur Amazon 
et la Fnac, stocke l'historique dans une base de données PostgreSQL, 
expose les données via une API REST Flask, et notifie l'utilisateur 
par email lorsqu'une baisse de prix est détectée.

### 2.1 Utilisateurs cibles
- **Particuliers** souhaitant acheter un produit au meilleur prix
- **Utilisateurs tech-savvy** à l'aise avec une solution auto-hébergée

---

## 3. Objectifs fonctionnels

### 3.1 Objectifs chiffrés

| Objectif | Valeur cible |
|---|---|
| Nombre de produits surveillés | 100 produits simultanément |
| Fréquence de scraping | Toutes les 30 minutes |
| Délai d'alerte après baisse de prix | Moins de 30 minutes |
| Historique des prix conservé | 6 mois glissants |
| Disponibilité de l'API | 99% uptime |

### 3.2 Fonctionnalités principales

- **Scraping automatique** : collecte des prix toutes les 30 minutes 
  sur Amazon et la Fnac
- **Stockage historique** : conservation des prix dans PostgreSQL 
  sur 6 mois
- **API REST** : exposition des données de prix via endpoints Flask
- **Alertes email** : notification automatique lors d'une baisse de prix
- **Monitoring** : supervision de l'infrastructure et de l'application 
  via Prometheus et Grafana

### 3.3 Fonctionnalités hors périmètre
- Application mobile
- Interface graphique utilisateur (frontend)
- Paiement en ligne
- Comparateur multi-produits automatique

---

## 4. Contraintes

### 4.1 Contraintes techniques
- **Budget** : utilisation exclusive du Free Tier AWS (t3.micro)
- **Ressources** : projet développé en solo
- **IP dynamique** : adresse IP personnelle variable selon le réseau

### 4.2 Contraintes de sécurité
- Aucun secret en clair dans le code source
- Séparation réseau public/privé obligatoire
- Accès SSH sécurisé via AWS SSM Session Manager

---

## 5. Choix techniques justifiés

### 5.1 Flask vs FastAPI
**Choix : Flask**  
Flask est plus léger et suffisant pour une API REST simple sans 
validation de schéma complexe. FastAPI aurait apporté de la complexité 
inutile pour le périmètre de ce projet.

### 5.2 PostgreSQL vs SQLite
**Choix : PostgreSQL**  
PostgreSQL offre une meilleure robustesse pour les données relationnelles 
et les requêtes d'historique de prix. SQLite n'est pas adapté à un 
déploiement multi-conteneurs.

### 5.3 Squid Proxy vs NAT Gateway AWS
**Choix : Squid Proxy auto-hébergé**  
La NAT Gateway AWS managée coûte environ 32$/mois — incompatible avec 
le Free Tier. Le proxy Squid déployé sur l'EC2 public permet à l'EC2 
privé d'accéder à internet de manière contrôlée, gratuite et auditable. 
C'est un arbitrage coût/sécurité raisonné qui conserve la séparation 
public/privé exigée par les bonnes pratiques.

### 5.4 Terraform vs scripts Bash pour l'infra
**Choix : Terraform**  
Terraform permet une gestion déclarative, reproductible et versionnée 
de l'infrastructure. Les scripts Bash sont utilisés en complément pour 
le provisionnement applicatif.

### 5.5 Ansible vs Chef/Puppet
**Choix : Ansible**  
Ansible est agentless (pas d'installation sur les cibles), simple à 
prendre en main et suffisant pour la configuration de deux EC2.

### 5.6 Prometheus + Grafana vs CloudWatch
**Choix : Prometheus + Grafana**  
CloudWatch est limité à l'écosystème AWS et génère des coûts 
supplémentaires. Prometheus + Grafana est open source, portable, 
et offre plus de flexibilité dans la définition des métriques et alertes.

---

## 6. Architecture technique

### 6.1 Vue d'ensemble
nternet
│
▼
┌─────────────────────────────┐
│ EC2 Public (subnet public)  │
│  - Nginx (reverse proxy)    │
│  - Squid (proxy sortant)    │
└──────────────┬──────────────┘
│ VPC interne
▼
┌─────────────────────────────┐
│ EC2 Privé (subnet privé)    │
│  - API Flask                │
│  - Scraper Python           │
│  - PostgreSQL               │
└─────────────────────────────┘
### 6.2 Pipeline CI/CD
Push GitHub (main)
│
▼
Build images Docker (API + Scraper)
│
▼
Scan sécurité Trivy (CRITICAL + HIGH)
│
▼
Push DockerHub

### 6.3 Stack technique complète

| Composant | Technologie | Justification |
|---|---|---|
| Scraper | Python | Bibliothèques scraping matures |
| API | Flask (Python) | Léger, suffisant pour le périmètre |
| Base de données | PostgreSQL 15 | Robuste, multi-conteneurs |
| Conteneurisation | Docker + Compose | Portabilité, isolation |
| Infrastructure | AWS EC2, VPC, SG | Free Tier disponible |
| IaC | Terraform | Reproductible, versionné |
| Configuration | Ansible | Agentless, simple |
| CI/CD | GitHub Actions | Intégré à GitHub, gratuit |
| Monitoring | Prometheus + Grafana | Open source, flexible |
| Alerting | Alertmanager | Natif Prometheus |
| Reverse proxy | Nginx | Standard, performant |
| Proxy sortant | Squid | Gratuit, alternative NAT Gateway |

---

## 7. Métriques de supervision et seuils

| Métrique | Seuil d'alerte | Justification |
|---|---|---|
| CPU | > 80% pendant 2 min | Au-delà, le scraper ralentit significativement |
| Mémoire | > 85% pendant 2 min | Risque d'OOM killer sur t3.micro (1GB RAM) |
| API indisponible | 1 min de downtime | SLA 99% = max 7h/an d'indisponibilité |
| Espace disque | > 80% pendant 5 min | 6 mois d'historique = ~2GB estimé |

---

## 8. Difficultés rencontrées et solutions

### 8.1 Accès internet depuis le subnet privé
**Problème** : L'EC2 privé ne peut pas accéder à internet pour 
télécharger les packages Docker. La NAT Gateway AWS coûte ~32$/mois.  
**Solution** : Déploiement d'un proxy Squid sur l'EC2 public, 
configuré pour router le trafic HTTP/HTTPS du subnet privé vers internet. 
Solution gratuite et sous contrôle total.

### 8.2 IP dynamique et Security Groups
**Problème** : L'IP personnelle change à chaque connexion réseau, 
rendant la restriction SSH par IP impossible sans reconfiguration constante.  
**Solution** : Mise en place d'AWS SSM Session Manager — suppression 
totale du port 22, accès via le service AWS sans exposition réseau.

### 8.3 Conflits Git entre branches
**Problème** : Conflits de merge entre les branches dev et main 
sur les fichiers de configuration Prometheus et Docker Compose.  
**Solution** : Utilisation de `git cherry-pick` pour appliquer 
sélectivement les commits pertinents sur main.

### 8.4 Versions d'actions GitHub dépréciées
**Problème** : Les actions GitHub Actions utilisaient Node.js 20, 
déprécié à partir de juin 2026.  
**Solution** : Mise à jour vers les versions Node.js 24 compatibles 
(checkout@v4, login-action@v3, etc.)

---

## 9. Livrables

- [x] Code source versionné (GitHub)
- [x] Dockerfiles API + Scraper
- [x] Infrastructure Terraform (VPC, EC2, SG)
- [x] Playbook Ansible (2 plays : nginx + app)
- [x] Pipeline CI/CD GitHub Actions
- [x] Stack monitoring Prometheus + Grafana + Alertmanager
- [x] Règles d'alerte (CPU, mémoire, API, disque)
- [x] Scripts Bash (provision.sh, deploy.sh, monitor.sh)
- [x] Cahier des charges
- [ ] Test d'alerte bout en bout (capture email)

---

## 10. Planning réalisé

| Phase | Contenu | Statut |
|---|---|---|
| Phase 1 | Infrastructure AWS + Terraform | ✅ |
| Phase 2 | Conteneurisation Docker | ✅ |
| Phase 3 | CI/CD GitHub Actions | ✅ |
| Phase 4 | Ansible + déploiement | ✅ |
| Phase 5 | Monitoring + alerting | ✅ |
| Phase 6 | Scripts Bash | ✅ |
| Phase 7 | Sécurisation SSM | 🔄 En cours |
| Phase 8 | Tests et validation | 🔄 En cours |
