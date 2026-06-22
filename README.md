<p align="center">
  <img src="geopharma_logo_v2.svg" alt="GeoPharma Logo" width="400"/>
</p>

<h1 align="center">GeoPharma</h1>

<p align="center">
  <em>Vos médicaments, où que vous soyez</em>
</p>

<p align="center">
  Plateforme web de géolocalisation et gestion des pharmacies de Dakar.<br/>
  GeoPharma centralise toutes les pharmacies de Dakar sur une carte interactive.<br/>
  Trouvez la pharmacie la plus proche, commandez vos médicaments en ligne et suivez votre livraison en temps réel.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React.js%20%7C%20PHP%20%7C%20MySQL-4A9B6F?style=flat-square"/>
  <img src="https://img.shields.io/badge/Carte-Leaflet.js%20%2B%20OpenStreetMap-4A9B6F?style=flat-square"/>
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-4A9B6F?style=flat-square"/>
  <img src="https://img.shields.io/badge/Statut-En%20cours-orange?style=flat-square"/>
</p>

---

## Sommaire

- [Contexte](#contexte)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Équipe](#équipe)
- [Encadrement](#encadrement)

---

## Contexte

Au Sénégal, accéder à un médicament peut relever du parcours du combattant. Les patients ne savent pas toujours quelle pharmacie est ouverte, laquelle dispose du médicament recherché, ni comment s'y rendre — encore moins la nuit ou un jour férié.

GeoPharma apporte une réponse concrète : une plateforme web qui centralise en temps réel l'ensemble des pharmacies de Dakar, avec géolocalisation, itinéraire, commande en ligne et livraison à domicile.

---

## Fonctionnalités

### Carte & Localisation
- Carte interactive Leaflet.js avec toutes les pharmacies de Dakar
- Marqueurs colorés : 🟢 ouverte · 🟡 de garde · 🔴 fermée
- Géolocalisation automatique et calcul de la pharmacie la plus proche
- Itinéraire vers la pharmacie via OSRM (distance + temps estimé)
- Recherche et filtrage par statut et proximité

### Commande & Ordonnance
- Formulaire de commande avec upload d'ordonnance (photo ou PDF)
- Choix du mode de récupération : retrait en pharmacie ou livraison à domicile
- Suivi du statut en temps réel : En attente → Acceptée / Refusée → En livraison → Livrée
- Notification du motif en cas de refus

### Dashboard Pharmacien
- Réception et gestion des commandes entrantes
- Visualisation des ordonnances scannées
- Gestion des horaires normaux et des périodes de garde
- Notification du livreur via la plateforme

### Dashboard Livreur
- Réception des commandes assignées
- Mise à jour du statut : Commande récupérée / Commande livrée

### Dashboard Administrateur
- Validation des comptes pharmaciens
- Gestion du planning des gardes
- Statistiques globales de la plateforme
- Gestion et modération des utilisateurs

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React.js |
| Carte | Leaflet.js + OpenStreetMap |
| Routing itinéraire | OSRM |
| Backend | PHP (PDO + REST API) |
| Base de données | MySQL |
| Authentification | JWT + bcrypt |
| Upload fichiers | FormData (React) + PHP multipart |
| Déploiement | XAMPP (local) |
| Versioning | Git + GitHub |

---

## Installation

### Prérequis

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL + PHP)
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/Junias-TTJ/geopharma.git
cd geopharma

# 2. Installer les dépendances frontend
cd frontend
npm install
npm start

# 3. Configurer la base de données
# Ouvrir phpMyAdmin et exécuter :
# database/geopharma_database.sql

# 4. Configurer le backend
# Copier et renseigner le fichier de config :
cp backend/config.example.php backend/config.php
# Renseigner : DB_HOST, DB_NAME, DB_USER, DB_PASS, JWT_SECRET

# 5. Lancer Apache via XAMPP et placer le dossier backend dans htdocs/
```

---

## Structure du projet

```
geopharma/
├── frontend/          
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
├── backend/           
│   ├── config.php
│   ├── routes/
│   └── controllers/
├── database/
│   └── geopharma_bdd.sql
└── README.md
```

---

## Équipe

| Nom | Email | Classe |
|---|---|---|
| Mame Diarra Bousso Dioum | dioummamediarrabousso2@gmail.com | L2 GLSI A |
| Junias Tiamnang Tiogang | juniedouce@gmail.com | L2 GLSI A |
| Khadyja Camara | camarakhadyja1@gmail.com | L2 GLSI C |

---

## Encadrement

Projet encadré par **Dr Lamine Ba**
Département Génie Informatique (DGI)
École Supérieure Polytechnique de Dakar (ESP/UCAD)
Année académique 2025-2026
