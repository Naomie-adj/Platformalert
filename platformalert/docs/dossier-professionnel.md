# Dossier Professionnel — ASD
**Candidate** : Fifame Machella Naomie Marie-Reine ADJOVI  
**Titre** : Administrateur Systèmes DevOps  
**Centre** : École iT — Brussels  
**Session** : 2026  

---

## 1. Présentation du parcours

Étudiante en troisième année de Bachelor Architecte des Systèmes 
d'Information à l'École iT de Bruxelles (promotion 2023-2026), je me 
spécialise dans l'administration systèmes et le DevOps. Mon parcours 
combine une formation technique approfondie, une expérience en support 
IT en cabinet médical, et un stage administratif et digital à l'ONEM.

| Période | Poste | Organisation |
|---|---|---|
| Sept. 2025 – Déc. 2025 | IT Support Technician | Cabinet médical O'VIVE — Brussels |
| Juil. 2025 – Août 2025 | Stagiaire Support Digital | ONEM — Brussels |
| Août 2024 – Avr. 2025 | Agent Call Center | Phonecom — Brussels |

---

## 2. Tableau des compétences couvertes

| Bloc | Compétence | Statut | Source |
|---|---|---|---|
| BC01 | CP1 — Scripts Bash | ✅ | Projet PlatformAlert |
| BC01 | CP2 — IaC Terraform + Ansible | ✅ | Projet PlatformAlert |
| BC01 | CP3 — Sécurité | ✅ | Projet PlatformAlert + O'VIVE |
| BC01 | CP4 — Mise en production cloud | ✅ | Projet PlatformAlert |
| BC02 | CP1 — Environnement de test | ✅ | Projet PlatformAlert |
| BC02 | CP2 — Stockage et backup | ⚠️ | Projet PlatformAlert |
| BC02 | CP3 — Containers Docker | ✅ | Projet PlatformAlert |
| BC02 | CP4 — CI/CD Pipeline | ✅ | Projet PlatformAlert |
| BC03 | CP1 — Métriques et KPI | ✅ | Projet PlatformAlert |
| BC03 | CP2 — Supervision | ✅ | Projet PlatformAlert |
| BC03 | CP3 — Anglais technique | ✅ | CV anglais + formation |

---

## 3. Situations professionnelles — Format STAR

---

### BC01-CP1 — Scripts Bash de provisionnement

**SITUATION** : Dans le cadre du projet PlatformAlert, plusieurs 
opérations d'administration devaient être réalisées manuellement et de 
manière répétitive sur les serveurs EC2 AWS : installation de Docker, 
déploiement de l'application, vérification de l'état des services.

**TÂCHE** : Automatiser ces opérations pour garantir leur 
reproductibilité, réduire le risque d'erreur humaine, et permettre à 
n'importe qui de provisionner, déployer et superviser l'application 
sans connaître les commandes individuelles.

**ACTION** : J'ai développé trois scripts Bash structurés :
- `provision.sh` : installe Docker CE sur Ubuntu vierge (mise à jour 
  système, repository officiel, installation, vérification finale)
- `deploy.sh` : vérifie les prérequis, pull les images, arrête les 
  conteneurs existants, lance docker compose, vérifie l'état
- `monitor.sh` : vérifie l'état HTTP des services, affiche CPU/mémoire 
  par conteneur, contrôle l'espace disque avec seuil à 80%

**RÉSULTAT** : Opérations exécutables en une seule commande. 
Provisionnement d'un serveur en moins de 5 minutes. Scripts versionnés 
et documentés dans Git.

---

### BC01-CP2 — Infrastructure as Code (Terraform + Ansible)

**SITUATION** : Le projet PlatformAlert nécessitait une infrastructure 
AWS complète (VPC, subnets, Security Groups, EC2). La configuration 
manuelle via la console AWS prenait plusieurs heures et était source 
d'erreurs.

**TÂCHE** : Provisionner l'infrastructure avec Terraform et configurer 
les serveurs avec Ansible, de manière reproductible et versionnée.

**ACTION** :
- **Terraform** : main.tf provisionne VPC, 2 subnets, Internet Gateway, 
  Security Groups, 2 EC2 Ubuntu, IAM Role SSM, VPC Endpoints, Key Pair
- **Ansible** : playbook en 2 plays — Play 1 configure l'EC2 public 
  (Docker, Nginx, Squid proxy), Play 2 configure l'EC2 privé 
  (proxy apt, Docker, déploiement app)

**RÉSULTAT** : Infrastructure reproductible en 3 minutes 
(`terraform apply`). Configuration des serveurs automatisée en 10 
minutes. Zéro configuration manuelle. Versionné dans Git.

---

### BC01-CP3 — Sécurité de l'infrastructure

**SITUATION** : Le port SSH (22) était ouvert à `0.0.0.0/0`. Mon IP 
personnelle étant dynamique, impossible de restreindre l'accès sans 
reconfigurer Terraform à chaque changement de réseau.

**TÂCHE** : Sécuriser l'accès aux EC2 sans exposer le port 22 sur 
internet.

**ACTION** : Mise en place d'AWS SSM Session Manager :
1. IAM Role avec policy `AmazonSSMManagedInstanceCore`
2. Instance Profile attaché aux deux EC2
3. VPC Endpoints SSM (ssm, ssmmessages, ec2messages)
4. Suppression totale du port 22 des Security Groups
5. Installation de l'agent SSM sur Ubuntu

Au cabinet O'VIVE : gestion des comptes AD avec principe du moindre 
privilège, permissions d'accès minimales sur Windows 10/11.

**RÉSULTAT** : Port 22 supprimé. Connexion via 
`aws ssm start-session` sans exposition réseau. Audit dans CloudTrail. 
Solution gratuite (Free Tier).

---

### BC01-CP4 — Déploiement en production cloud

**SITUATION** : L'application PlatformAlert devait être déployée sur 
l'EC2 privé via Ansible, avec la contrainte que ce serveur n'a pas 
d'accès internet direct (subnet privé, pas de NAT Gateway).

**TÂCHE** : Déployer l'application complète de manière automatisée 
en résolvant le problème d'accès internet depuis le subnet privé.

**ACTION** : Déploiement d'un proxy Squid sur l'EC2 public 
(alternative gratuite à la NAT Gateway AWS ~32$/mois). Le playbook 
Ansible configure le proxy au niveau d'apt, du système et du daemon 
Docker, puis copie les fichiers et lance docker compose.

**RÉSULTAT** : Application déployée automatiquement. Séparation 
réseau maintenue. Coût zéro.

---

### BC02-CP1 — Environnement de test et scan de sécurité

**SITUATION** : Le pipeline CI/CD devait inclure une validation 
automatique pour détecter les vulnérabilités avant déploiement.

**TÂCHE** : Intégrer un scan de sécurité dans GitHub Actions pour 
bloquer les déploiements contenant des vulnérabilités critiques.

**ACTION** : Intégration de Trivy (`aquasecurity/trivy-action@v0.35.0`) 
dans le pipeline. Lors des premiers scans, 3 vulnérabilités HIGH 
détectées (CVE-2026-23949, CVE-2026-24049) dans setuptools et wheel — 
corrigées en ajoutant une mise à jour explicite dans les Dockerfiles :
```dockerfile
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
```

**RÉSULTAT** : Pipeline bloque tout déploiement vulnérable. 
Images actuelles : 0 vulnérabilité CRITICAL/HIGH.

---

### BC02-CP2 — Stockage et persistance des données

**SITUATION** : PostgreSQL stocke l'historique des prix. Les données 
doivent survivre aux redémarrages des conteneurs.

**TÂCHE** : Mettre en place une stratégie de persistance des données.

**ACTION** : Volume Docker nommé (`postgres_data`) dans 
docker-compose.yml. Variables d'environnement via fichier `.env` 
non versionné (exclu via `.gitignore`).

**RÉSULTAT** : Données persistées entre les redémarrages. 
Credentials sécurisés. Amélioration prévue : AWS Backup.

---

### BC02-CP3 — Conteneurisation Docker

**SITUATION** : PlatformAlert est composée de 3 services (API Flask, 
Scraper Python, PostgreSQL) devant être isolés et déployables de 
manière cohérente.

**TÂCHE** : Conteneuriser l'application et orchestrer les services.

**ACTION** : Deux Dockerfiles optimisés basés sur `python:3.11-slim`. 
Mise à jour pip/setuptools/wheel pour éliminer les vulnérabilités. 
docker-compose.yml avec 3 services, dépendances, variables 
d'environnement, volumes et build args proxy pour le subnet privé.

**RÉSULTAT** : Déployable avec `docker compose up -d`. Images sur 
DockerHub. 0 vulnérabilité. Reproductible partout.

---

### BC02-CP4 — Pipeline CI/CD GitHub Actions

**SITUATION** : Chaque modification nécessitait un build manuel des 
images Docker, un push DockerHub et un déploiement manuel.

**TÂCHE** : Automatiser le cycle build → scan → push sur chaque push 
sur main.

**ACTION** : `.github/workflows/deploy.yml` avec : checkout (v4), 
Buildx, login DockerHub, build+push API et Scraper (v6), scan Trivy 
sur les deux images. Corrections : Node.js 24, chemins Docker, 
vulnérabilités Trivy.

**RÉSULTAT** : Pipeline automatique < 1 minute. 0 vulnérabilité. 
Aucune intervention manuelle.

---

### BC03-CP1 — Métriques et KPI

**SITUATION** : Les seuils d'alerte devaient être justifiés par les 
objectifs métier et non arbitraires.

**TÂCHE** : Définir les KPI et seuils d'alerte cohérents avec le CDC.

**ACTION** : 4 règles Prometheus avec seuils justifiés :
- CPU > 80% / 2 min → scraper ralentit
- Mémoire > 85% / 2 min → risque OOM sur t3.micro (1GB)
- API down / 1 min → SLA 99%
- Disque > 80% / 5 min → 6 mois d'historique ~2GB

**RÉSULTAT** : 4 règles documentées et testées. Alerte CPUElevee 
déclenchée et email reçu le 13/05/2026.

---

### BC03-CP2 — Supervision Prometheus + Grafana

**SITUATION** : Aucune visibilité sur l'état des services PlatformAlert 
après déploiement. Problèmes détectables uniquement après signalement.

**TÂCHE** : Déployer une stack de supervision complète avec alerting.

**ACTION** : Stack Docker sur EC2 public :
- Prometheus (métriques toutes les 15s)
- Node Exporter (métriques système hôte réelles)
- Alertmanager (email via Gmail SMTP)
- Grafana (dashboards)

Test bout en bout : stress-ng → CPU > 80% → pending → firing → 
email reçu en < 3 minutes.

**RÉSULTAT** : Monitoring 24/7 opérationnel. 4 alertes définies. 
Email reçu en < 3 min. Preuve documentée.

---

### BC03-CP3 — Anglais technique

**SITUATION** : Documentation technique, outils et ressources 
majoritairement en anglais.

**TÂCHE** : Lire, comprendre et appliquer de la documentation 
technique en anglais.

**ACTION** : Consultation de la documentation officielle en anglais 
de AWS, Terraform, Ansible, GitHub Actions, Trivy, Prometheus, Grafana. 
CV professionnel rédigé en anglais.

**RÉSULTAT** : Résolution autonome de problèmes techniques via 
ressources anglaises. Niveau B2/C1 en anglais technique écrit et lu.

---

## 4. Bilan

### Compétences techniques acquises

| Domaine | Compétences |
|---|---|
| Systèmes | Ubuntu/Debian, Windows Server, Active Directory |
| Cloud & IaC | AWS (EC2, VPC, IAM, SSM), Terraform, Ansible |
| Containers | Docker, Docker Compose, DockerHub |
| CI/CD | GitHub Actions, Trivy |
| Monitoring | Prometheus, Grafana, Alertmanager |
| Développement | Python, Bash, Git |
| Sécurité | SSM, gestion secrets, scan CVE |

### Objectif professionnel

À l'issue de ce titre, mon objectif est d'intégrer une équipe DevOps 
ou SRE en tant qu'Administratrice Systèmes DevOps Junior. PlatformAlert 
m'a permis de maîtriser le cycle complet : IaC → conteneurisation → 
CI/CD → supervision. Je souhaite approfondir sur des infrastructures 
plus complexes (Kubernetes, multi-région AWS).
